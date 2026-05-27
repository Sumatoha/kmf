package api

import (
	"io"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/service"
)

func listOrdersHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var status *model.OrderStatus
		if s := r.URL.Query().Get("status"); s != "" {
			st := model.OrderStatus(s)
			if !st.Valid() {
				writeError(w, http.StatusBadRequest, "invalid status value")
				return
			}
			status = &st
		}
		items, err := d.OrdersR.ListByTenant(r.Context(), tenantIDFrom(r.Context()), status, 200)
		if err != nil {
			d.Log.Error("list orders", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
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
		o, err := d.OrdersR.GetByID(r.Context(), tenantIDFrom(r.Context()), id)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			d.Log.Error("get order", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		writeJSON(w, http.StatusOK, o)
	}
}

type createOrderReq struct {
	ClientID    *string `json:"client_id"`
	ClientPhone *string `json:"client_phone"`
	ClientName  *string `json:"client_name"`
	ServiceID   string  `json:"service_id"`
	AddressText string  `json:"address_text"`
	ScheduledAt string  `json:"scheduled_at"`
	Notes       *string `json:"notes"`
	MasterID    *string `json:"master_id"`
}

func createOrderHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createOrderReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		serviceID, err := uuid.Parse(req.ServiceID)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid service_id")
			return
		}
		scheduled, err := time.Parse(time.RFC3339, req.ScheduledAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "scheduled_at must be RFC3339")
			return
		}
		if req.AddressText == "" {
			writeError(w, http.StatusBadRequest, "address_text required")
			return
		}
		in := service.CreateManualOrderInput{
			TenantID:    tenantIDFrom(r.Context()),
			ServiceID:   serviceID,
			AddressText: req.AddressText,
			ScheduledAt: scheduled,
			Notes:       req.Notes,
			ClientPhone: req.ClientPhone,
			ClientName:  req.ClientName,
		}
		if req.ClientID != nil && *req.ClientID != "" {
			id, err := uuid.Parse(*req.ClientID)
			if err != nil {
				writeError(w, http.StatusBadRequest, "invalid client_id")
				return
			}
			in.ClientID = &id
		}
		if req.MasterID != nil && *req.MasterID != "" {
			id, err := uuid.Parse(*req.MasterID)
			if err != nil {
				writeError(w, http.StatusBadRequest, "invalid master_id")
				return
			}
			in.MasterID = &id
		}
		o, err := d.Orders.CreateManual(r.Context(), in)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, o)
	}
}

type assignOrderReq struct {
	MasterID string `json:"master_id"`
}

func assignOrderHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		var req assignOrderReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		masterID, err := uuid.Parse(req.MasterID)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid master_id")
			return
		}
		tenantID := tenantIDFrom(r.Context())
		o, err := d.Orders.AssignByAdmin(r.Context(), tenantID, id, masterID)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			d.Log.Error("assign order", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
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
		if err := decodeJSON(r, &req); err != nil && err != io.EOF {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		tenantID := tenantIDFrom(r.Context())
		o, err := d.Orders.Cancel(r.Context(), tenantID, id, req.Reason)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			d.Log.Error("cancel order", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		writeJSON(w, http.StatusOK, o)
	}
}
