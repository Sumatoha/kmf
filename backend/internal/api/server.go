package api

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/service"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

type Deps struct {
	Auth     *service.AuthService
	Orders   *service.OrderService
	Masters  *service.MasterService
	Webhooks *service.WebhookService

	Tenants  *storage.TenantRepo
	Clients  *storage.ClientRepo
	Services *storage.ServiceRepo
	OrdersR  *storage.OrderRepo
	MastersR *storage.MasterRepo
	Pool     *pgxpool.Pool
	Log      *slog.Logger

	CORSOrigins []string
}

func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()
	r.Use(securityHeadersMiddleware)
	r.Use(requestIDMiddleware)
	r.Use(loggingMiddleware(d.Log))

	origins := d.CORSOrigins
	if len(origins) == 0 {
		origins = []string{"http://localhost:3000"}
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", requestIDHeader},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/healthz", healthHandler(d))

	authLimiter := rateLimitMiddleware(5, 10)

	r.Route("/api/v1", func(r chi.Router) {
		r.With(authLimiter).Post("/auth/login", loginHandler(d))
		r.With(authLimiter).Post("/auth/register", registerHandler(d))

		r.Group(func(r chi.Router) {
			r.Use(authMiddleware(d.Auth))

			r.Get("/me", meHandler(d))

			r.Route("/services", func(r chi.Router) {
				r.Get("/", listServicesHandler(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Post("/", createServiceHandler(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Patch("/{id}", updateServiceHandler(d))
			})

			r.Route("/clients", func(r chi.Router) {
				r.Get("/", listClientsHandler(d))
			})

			r.Route("/masters", func(r chi.Router) {
				r.Get("/", listMastersHandler(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Post("/invite", inviteMasterHandler(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Patch("/{id}/availability", setMasterAvailabilityHandler(d))
			})

			r.Route("/orders", func(r chi.Router) {
				r.Get("/", listOrdersHandler(d))
				r.Post("/", createOrderHandler(d))
				r.Get("/{id}", getOrderHandler(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Post("/{id}/assign", assignOrderHandler(d))
				r.Post("/{id}/cancel", cancelOrderHandler(d))
			})

			r.Route("/webhooks", func(r chi.Router) {
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Get("/", listWebhooksHandler(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Post("/", createWebhookHandler(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Delete("/{id}", deleteWebhookHandler(d))
			})

			r.Route("/exports", func(r chi.Router) {
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Get("/orders.csv", exportOrdersCSV(d))
				r.With(requireRole(model.RoleOwner, model.RoleAdmin)).Get("/clients.csv", exportClientsCSV(d))
			})

			r.Get("/dashboard/stats", dashboardStatsHandler(d))
		})
	})

	return r
}

func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next.ServeHTTP(w, r)
	})
}

func healthHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		dbOK := true
		if d.Pool != nil {
			if err := d.Pool.Ping(ctx); err != nil {
				dbOK = false
			}
		}
		status := http.StatusOK
		if !dbOK {
			status = http.StatusServiceUnavailable
		}
		writeJSON(w, status, map[string]any{
			"status": map[string]any{
				"db": dbOK,
			},
		})
	}
}
