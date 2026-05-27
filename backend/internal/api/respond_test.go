package api

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/sumatoha/kmf/backend/internal/service"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

func TestWriteJSON(t *testing.T) {
	rr := httptest.NewRecorder()
	writeJSON(rr, 200, map[string]string{"hello": "world"})

	if ct := rr.Header().Get("Content-Type"); ct != "application/json; charset=utf-8" {
		t.Errorf("Content-Type = %q", ct)
	}
	if rr.Code != 200 {
		t.Errorf("status = %d, want 200", rr.Code)
	}

	var body map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["hello"] != "world" {
		t.Errorf("body = %v", body)
	}
}

func TestWriteError(t *testing.T) {
	rr := httptest.NewRecorder()
	writeError(rr, 400, "bad request")

	if rr.Code != 400 {
		t.Errorf("status = %d, want 400", rr.Code)
	}

	var body errResp
	if err := json.Unmarshal(rr.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Error != "bad request" {
		t.Errorf("error = %q, want %q", body.Error, "bad request")
	}
}

func TestMapServiceError(t *testing.T) {
	tests := []struct {
		err    error
		status int
	}{
		{service.ErrInvalidCredentials, 401},
		{service.ErrUserInactive, 403},
		{service.ErrServiceNotFound, 404},
		{service.ErrOrderNotFound, 404},
		{service.ErrInvalidState, 409},
		{storage.ErrNotFound, 404},
	}
	for _, tt := range tests {
		rr := httptest.NewRecorder()
		handled := mapServiceError(rr, tt.err)
		if !handled {
			t.Errorf("mapServiceError(%v) should have handled", tt.err)
			continue
		}
		if rr.Code != tt.status {
			t.Errorf("mapServiceError(%v): status = %d, want %d", tt.err, rr.Code, tt.status)
		}
	}
}

func TestMapServiceError_UnknownError(t *testing.T) {
	rr := httptest.NewRecorder()
	handled := mapServiceError(rr, storage.ErrNotFound)
	if !handled {
		t.Error("ErrNotFound should be handled")
	}

	rr2 := httptest.NewRecorder()
	handled2 := mapServiceError(rr2, nil)
	if handled2 {
		t.Error("nil error should not be handled")
	}
}
