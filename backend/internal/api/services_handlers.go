package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func listServicesHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		items, err := d.Services.ListByTenant(r.Context(), tenantIDFrom(r.Context()))
		if err != nil {
			d.Log.Error("list services", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"items": items})
	}
}

type createServiceReq struct {
	Name            string  `json:"name"`
	Description     *string `json:"description"`
	BasePrice       float64 `json:"base_price"`
	DurationMinutes int     `json:"duration_minutes"`
}

func createServiceHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createServiceReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		if req.Name == "" || req.DurationMinutes <= 0 {
			writeError(w, http.StatusBadRequest, "name and duration_minutes required")
			return
		}
		s, err := d.Services.Create(r.Context(), tenantIDFrom(r.Context()), req.Name, req.Description, req.BasePrice, req.DurationMinutes)
		if err != nil {
			d.Log.Error("create service", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		writeJSON(w, http.StatusCreated, s)
	}
}

type updateServiceReq struct {
	Name            string  `json:"name"`
	Description     *string `json:"description"`
	BasePrice       float64 `json:"base_price"`
	DurationMinutes int     `json:"duration_minutes"`
	IsActive        bool    `json:"is_active"`
}

func updateServiceHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		var req updateServiceReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		tenantID := tenantIDFrom(r.Context())
		if err := d.Services.Update(r.Context(), tenantID, id, req.Name, req.Description, req.BasePrice, req.DurationMinutes, req.IsActive); err != nil {
			d.Log.Error("update service", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		updated, err := d.Services.GetByID(r.Context(), tenantID, id)
		if err != nil {
			d.Log.Error("get updated service", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		writeJSON(w, http.StatusOK, updated)
	}
}
