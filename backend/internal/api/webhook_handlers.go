package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/service"
)

type createWebhookReq struct {
	URL         string   `json:"url"`
	Events      []string `json:"events"`
	Description *string  `json:"description"`
}

func listWebhooksHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		items, err := d.Webhooks.List(r.Context(), tenantIDFrom(r.Context()))
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"items": items})
	}
}

func createWebhookHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createWebhookReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		if req.URL == "" {
			writeError(w, http.StatusBadRequest, "url required")
			return
		}
		hook, err := d.Webhooks.Create(r.Context(), service.CreateWebhookInput{
			TenantID:    tenantIDFrom(r.Context()),
			URL:         req.URL,
			Events:      req.Events,
			Description: req.Description,
		})
		if err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, hook)
	}
}

func deleteWebhookHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid id")
			return
		}
		if err := d.Webhooks.Delete(r.Context(), tenantIDFrom(r.Context()), id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
