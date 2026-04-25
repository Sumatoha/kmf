package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/service"
)

func listMastersHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		items, err := d.Masters.ListByTenant(r.Context(), tenantIDFrom(r.Context()))
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"items": items})
	}
}

type inviteMasterReq struct {
	FullName string  `json:"full_name"`
	Phone    *string `json:"phone"`
}

func inviteMasterHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req inviteMasterReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		if req.FullName == "" {
			writeError(w, http.StatusBadRequest, "full_name required")
			return
		}
		res, err := d.Masters.Invite(r.Context(), service.InviteMasterInput{
			TenantID: tenantIDFrom(r.Context()),
			FullName: req.FullName,
			Phone:    req.Phone,
		})
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, res)
	}
}

type setAvailabilityReq struct {
	Available bool `json:"available"`
}

func setMasterAvailabilityHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		var req setAvailabilityReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		if err := d.Masters.SetAvailability(r.Context(), id, req.Available); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	}
}
