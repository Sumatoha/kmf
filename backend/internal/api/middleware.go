package api

import (
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/service"
)

type ctxKey int

const (
	ctxKeyUserID ctxKey = iota + 1
	ctxKeyTenantID
	ctxKeyRole
)

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
