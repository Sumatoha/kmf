package api

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/sumatoha/kmf/backend/internal/service"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

type errResp struct {
	Error string `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if body == nil {
		return
	}
	if err := json.NewEncoder(w).Encode(body); err != nil {
		slog.Default().Error("encode response", "err", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, errResp{Error: msg})
}

func mapServiceError(w http.ResponseWriter, err error) bool {
	switch {
	case errors.Is(err, service.ErrInvalidCredentials):
		writeError(w, http.StatusUnauthorized, "invalid email or password")
	case errors.Is(err, service.ErrUserInactive):
		writeError(w, http.StatusForbidden, "user is inactive")
	case errors.Is(err, service.ErrServiceNotFound), errors.Is(err, storage.ErrNotFound):
		writeError(w, http.StatusNotFound, "not found")
	case errors.Is(err, service.ErrOrderNotFound):
		writeError(w, http.StatusNotFound, "order not found")
	case errors.Is(err, service.ErrInvalidState):
		writeError(w, http.StatusConflict, "invalid state for this action")
	default:
		return false
	}
	return true
}

const maxRequestBodySize = 1 << 20 // 1 MB

func decodeJSON(r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(nil, r.Body, maxRequestBodySize)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(dst)
}
