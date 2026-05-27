package service

import (
	"testing"
)

func TestIsPrivateHost(t *testing.T) {
	tests := []struct {
		host    string
		private bool
	}{
		{"localhost", true},
		{"127.0.0.1", true},
		{"::1", true},
		{"0.0.0.0", true},
		{"169.254.169.254", true},
		{"10.0.0.1", true},
		{"10.255.255.255", true},
		{"192.168.1.1", true},
		{"172.16.0.1", true},
		{"172.31.255.255", true},
		{"metadata.google.internal", true},

		{"example.com", false},
		{"8.8.8.8", false},
		{"1.2.3.4", false},
		{"cleanops.kz", false},
		{"172.32.0.1", false},
		{"11.0.0.1", false},
	}
	for _, tt := range tests {
		if got := isPrivateHost(tt.host); got != tt.private {
			t.Errorf("isPrivateHost(%q) = %v, want %v", tt.host, got, tt.private)
		}
	}
}

func TestSignPayload(t *testing.T) {
	secret := "test-secret"
	body := []byte(`{"event":"order.created"}`)
	sig := signPayload(secret, body)
	if sig == "" {
		t.Fatal("signPayload returned empty string")
	}
	if len(sig) != 64 {
		t.Errorf("expected 64 hex chars, got %d", len(sig))
	}
	sig2 := signPayload(secret, body)
	if sig != sig2 {
		t.Error("signPayload is not deterministic")
	}
	sig3 := signPayload("other-secret", body)
	if sig == sig3 {
		t.Error("different secrets should produce different signatures")
	}
}

func TestGenerateSecret(t *testing.T) {
	s1, err := generateSecret()
	if err != nil {
		t.Fatalf("generateSecret: %v", err)
	}
	if len(s1) != 48 {
		t.Errorf("expected 48 hex chars, got %d", len(s1))
	}
	s2, err := generateSecret()
	if err != nil {
		t.Fatalf("generateSecret: %v", err)
	}
	if s1 == s2 {
		t.Error("two secrets should not be identical")
	}
}
