package api

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/service"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

type Deps struct {
	Auth     *service.AuthService
	Orders   *service.OrderService
	Masters  *service.MasterService
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
	r.Use(requestIDMiddleware)
	r.Use(loggingMiddleware(d.Log))

	origins := d.CORSOrigins
	if len(origins) == 0 {
		origins = []string{"*"}
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", requestIDHeader},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/healthz", healthHandler(d))

	r.Route("/api/v1", func(r chi.Router) {
		// public
		r.Post("/auth/login", loginHandler(d))

		// protected (CRM)
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware(d.Auth))

			r.Get("/me", meHandler(d))

			r.Route("/services", func(r chi.Router) {
				r.Get("/", listServicesHandler(d))
				r.Post("/", createServiceHandler(d))
				r.Patch("/{id}", updateServiceHandler(d))
			})

			r.Route("/clients", func(r chi.Router) {
				r.Get("/", listClientsHandler(d))
			})

			r.Route("/masters", func(r chi.Router) {
				r.Get("/", listMastersHandler(d))
				r.Post("/invite", inviteMasterHandler(d))
				r.Patch("/{id}/availability", setMasterAvailabilityHandler(d))
			})

			r.Route("/orders", func(r chi.Router) {
				r.Get("/", listOrdersHandler(d))
				r.Get("/{id}", getOrderHandler(d))
				r.Post("/{id}/assign", assignOrderHandler(d))
				r.Post("/{id}/cancel", cancelOrderHandler(d))
			})

			r.Get("/dashboard/stats", dashboardStatsHandler(d))
		})
	})

	return r
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
