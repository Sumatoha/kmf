package client

import (
	"testing"
	"time"
)

func TestParseScheduled_UTC(t *testing.T) {
	got, err := parseScheduled("2025-06-15", "14", "")
	if err != nil {
		t.Fatalf("parseScheduled: %v", err)
	}
	want := time.Date(2025, 6, 15, 14, 0, 0, 0, time.UTC)
	if !got.Equal(want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestParseScheduled_WithTimezone(t *testing.T) {
	got, err := parseScheduled("2025-06-15", "10", "Asia/Almaty")
	if err != nil {
		t.Fatalf("parseScheduled: %v", err)
	}
	loc, _ := time.LoadLocation("Asia/Almaty")
	want := time.Date(2025, 6, 15, 10, 0, 0, 0, loc)
	if !got.Equal(want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestParseScheduled_InvalidTimezone_FallsBackToUTC(t *testing.T) {
	got, err := parseScheduled("2025-06-15", "10", "Invalid/Zone")
	if err != nil {
		t.Fatalf("parseScheduled: %v", err)
	}
	if got.Location() != time.UTC {
		t.Errorf("expected UTC fallback, got %v", got.Location())
	}
}

func TestParseScheduled_InvalidDate(t *testing.T) {
	if _, err := parseScheduled("not-a-date", "10", ""); err == nil {
		t.Error("should fail on invalid date")
	}
}

func TestParseScheduled_InvalidHour(t *testing.T) {
	if _, err := parseScheduled("2025-06-15", "abc", ""); err == nil {
		t.Error("should fail on non-numeric hour")
	}
}

func TestSanitizePhone(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"+7 900 123-45-67", "+7 900 123-45-67"},
		{"(495) 123-4567", "495 123-4567"},
		{"+7<script>alert(1)</script>900", "+71900"},
		{"abc123def456", "123456"},
		{"", ""},
		{"+1 555 000-0000", "+1 555 000-0000"},
	}
	for _, tt := range tests {
		if got := sanitizePhone(tt.input); got != tt.want {
			t.Errorf("sanitizePhone(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}
