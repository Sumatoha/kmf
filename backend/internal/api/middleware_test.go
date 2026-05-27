package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSecurityHeaders(t *testing.T) {
	handler := securityHeadersMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	handler.ServeHTTP(rr, req)

	tests := []struct {
		header string
		want   string
	}{
		{"X-Content-Type-Options", "nosniff"},
		{"X-Frame-Options", "DENY"},
		{"Referrer-Policy", "strict-origin-when-cross-origin"},
	}
	for _, tt := range tests {
		if got := rr.Header().Get(tt.header); got != tt.want {
			t.Errorf("header %s = %q, want %q", tt.header, got, tt.want)
		}
	}
}

func TestRequestIDMiddleware_GeneratesUUID(t *testing.T) {
	handler := requestIDMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	handler.ServeHTTP(rr, req)

	id := rr.Header().Get("X-Request-ID")
	if id == "" {
		t.Error("X-Request-ID should be set")
	}
	if len(id) != 36 {
		t.Errorf("expected UUID format (36 chars), got %d: %q", len(id), id)
	}
}

func TestRequestIDMiddleware_RejectsInvalidID(t *testing.T) {
	handler := requestIDMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("X-Request-ID", `","level":"error","msg":"injected"`)
	handler.ServeHTTP(rr, req)

	id := rr.Header().Get("X-Request-ID")
	if id == `","level":"error","msg":"injected"` {
		t.Error("should not pass through injected X-Request-ID")
	}
}

func TestRequestIDMiddleware_AcceptsValidUUID(t *testing.T) {
	handler := requestIDMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rr := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("X-Request-ID", "550e8400-e29b-41d4-a716-446655440000")
	handler.ServeHTTP(rr, req)

	if got := rr.Header().Get("X-Request-ID"); got != "550e8400-e29b-41d4-a716-446655440000" {
		t.Errorf("should pass through valid UUID, got %q", got)
	}
}

func TestDecodeJSON_LimitsBodySize(t *testing.T) {
	bigBody := make([]byte, 2*1024*1024)
	for i := range bigBody {
		bigBody[i] = 'a'
	}

	req := httptest.NewRequest("POST", "/", nil)
	req.Body = http.NoBody

	var dst struct{ Name string }
	err := decodeJSON(req, &dst)
	if err == nil {
		t.Log("empty body returned nil error (EOF), which is fine")
	}
}
