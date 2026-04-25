package api

import (
	"context"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/logger"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/service"
)

type ctxKey int

const (
	ctxKeyUserID ctxKey = iota + 1
	ctxKeyTenantID
	ctxKeyRole
	ctxKeyRequestID
)

const requestIDHeader = "X-Request-ID"

// requestIDMiddleware ensures every request has a request_id, accepting one
// from upstream if present, and echoes it in the response header.
func requestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := r.Header.Get(requestIDHeader)
		if reqID == "" {
			reqID = uuid.NewString()
		}
		w.Header().Set(requestIDHeader, reqID)
		ctx := context.WithValue(r.Context(), ctxKeyRequestID, reqID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// loggingMiddleware attaches a request-scoped logger to context, logs each
// completed request, and recovers from panics with a stack trace.
func loggingMiddleware(base *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			reqID, _ := r.Context().Value(ctxKeyRequestID).(string)
			scoped := base.With("request_id", reqID, "method", r.Method, "path", r.URL.Path)
			ctx := logger.Into(r.Context(), scoped)

			ww := &statusRecorder{ResponseWriter: w, status: 200}

			defer func() {
				if rec := recover(); rec != nil {
					scoped.With("panic", rec, "stack", string(debug.Stack())).Error("panic recovered")
					if !ww.headerWritten {
						w.Header().Set("Content-Type", "application/json; charset=utf-8")
						w.WriteHeader(http.StatusInternalServerError)
						_, _ = w.Write([]byte(`{"error":"internal server error"}`))
					}
				}
				dur := time.Since(start)
				scoped.With("status", ww.status, "duration_ms", dur.Milliseconds()).Info("request")
			}()

			next.ServeHTTP(ww, r.WithContext(ctx))
		})
	}
}

type statusRecorder struct {
	http.ResponseWriter
	status        int
	headerWritten bool
}

func (s *statusRecorder) WriteHeader(code int) {
	if s.headerWritten {
		return
	}
	s.status = code
	s.headerWritten = true
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(p []byte) (int, error) {
	if !s.headerWritten {
		s.headerWritten = true
	}
	return s.ResponseWriter.Write(p)
}

func authMiddleware(auth *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if !strings.HasPrefix(h, "Bearer ") {
				writeError(w, http.StatusUnauthorized, "missing bearer token")
				return
			}
			tok := strings.TrimPrefix(h, "Bearer ")
			claims, err := auth.Verify(tok)
			if err != nil {
				writeError(w, http.StatusUnauthorized, "invalid token")
				return
			}
			ctx := r.Context()
			ctx = context.WithValue(ctx, ctxKeyUserID, claims.UserID)
			ctx = context.WithValue(ctx, ctxKeyTenantID, claims.TenantID)
			ctx = context.WithValue(ctx, ctxKeyRole, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func userIDFrom(ctx context.Context) uuid.UUID {
	v, _ := ctx.Value(ctxKeyUserID).(uuid.UUID)
	return v
}

func tenantIDFrom(ctx context.Context) uuid.UUID {
	v, _ := ctx.Value(ctxKeyTenantID).(uuid.UUID)
	return v
}

func roleFrom(ctx context.Context) model.UserRole {
	v, _ := ctx.Value(ctxKeyRole).(model.UserRole)
	return v
}

func requireRole(roles ...model.UserRole) func(http.Handler) http.Handler {
	allowed := make(map[model.UserRole]bool, len(roles))
	for _, r := range roles {
		allowed[r] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !allowed[roleFrom(r.Context())] {
				writeError(w, http.StatusForbidden, "forbidden")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
