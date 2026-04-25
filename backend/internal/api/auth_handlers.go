package api

import (
	"net/http"
)

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
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
			writeError(w, http.StatusInternalServerError, err.Error())
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
