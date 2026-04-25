package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
)

func listOrdersHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var status *model.OrderStatus
		if s := r.URL.Query().Get("status"); s != "" {
			st := model.OrderStatus(s)
			status = &st
		}
		items, err := d.OrdersR.ListByTenant(r.Context(), tenantIDFrom(r.Context()), status, 200)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"items": items})
	}
}

func getOrderHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		o, err := d.OrdersR.GetByID(r.Context(), id)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if o.TenantID != tenantIDFrom(r.Context()) {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeJSON(w, http.StatusOK, o)
	}
}

type cancelOrderReq struct {
	Reason string `json:"reason"`
}

func cancelOrderHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		var req cancelOrderReq
		_ = decodeJSON(r, &req)
		existing, err := d.OrdersR.GetByID(r.Context(), id)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if existing.TenantID != tenantIDFrom(r.Context()) {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		o, err := d.Orders.Cancel(r.Context(), id, req.Reason)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, o)
	}
}
