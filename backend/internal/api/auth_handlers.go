package api

import (
	"errors"
	"net/http"

	"github.com/sumatoha/kmf/backend/internal/service"
)

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type registerReq struct {
	TenantSlug string `json:"tenant_slug"`
	TenantName string `json:"tenant_name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	FullName   string `json:"full_name"`
}

func registerHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req registerReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		if req.TenantSlug == "" || req.TenantName == "" || req.Email == "" || req.Password == "" || req.FullName == "" {
			writeError(w, http.StatusBadRequest, "all fields are required")
			return
		}
		res, err := d.Auth.Register(r.Context(), service.RegisterInput{
			TenantSlug: req.TenantSlug,
			TenantName: req.TenantName,
			Email:      req.Email,
			Password:   req.Password,
			FullName:   req.FullName,
		})
		if err != nil {
			if errors.Is(err, service.ErrSlugTaken) {
				writeError(w, http.StatusConflict, "slug already taken")
				return
			}
			if errors.Is(err, service.ErrEmailTaken) {
				writeError(w, http.StatusConflict, "email already registered")
				return
			}
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, res)
	}
}

func loginHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req loginReq
		if err := decodeJSON(r, &req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		if req.Email == "" || req.Password == "" {
			writeError(w, http.StatusBadRequest, "email and password required")
			return
		}
		res, err := d.Auth.Login(r.Context(), req.Email, req.Password)
		if err != nil {
			if mapServiceError(w, err) {
				return
			}
			d.Log.Error("login", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		writeJSON(w, http.StatusOK, res)
	}
}

func meHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"user_id":   userIDFrom(r.Context()),
			"tenant_id": tenantIDFrom(r.Context()),
			"role":      roleFrom(r.Context()),
		})
	}
}
