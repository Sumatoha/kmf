package api

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
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
	Log      *slog.Logger
}

func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

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
				r.Post("/{id}/cancel", cancelOrderHandler(d))
			})

			r.Get("/dashboard/stats", dashboardStatsHandler(d))
		})
	})

	return r
}
