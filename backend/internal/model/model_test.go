package model_test

import (
	"testing"

	"github.com/sumatoha/kmf/backend/internal/model"
)

func TestOrderStatus_Valid(t *testing.T) {
	tests := []struct {
		status model.OrderStatus
		want   bool
	}{
		{model.OrderStatusNew, true},
		{model.OrderStatusAssigned, true},
		{model.OrderStatusConfirmed, true},
		{model.OrderStatusInProgress, true},
		{model.OrderStatusDone, true},
		{model.OrderStatusCancelled, true},
		{"invalid", false},
		{"", false},
		{"NEW", false},
	}
	for _, tt := range tests {
		if got := tt.status.Valid(); got != tt.want {
			t.Errorf("OrderStatus(%q).Valid() = %v, want %v", tt.status, got, tt.want)
		}
	}
}

func TestUserRole_Valid(t *testing.T) {
	tests := []struct {
		role model.UserRole
		want bool
	}{
		{model.RoleOwner, true},
		{model.RoleAdmin, true},
		{model.RoleDispatcher, true},
		{"superadmin", false},
		{"", false},
		{"Owner", false},
	}
	for _, tt := range tests {
		if got := tt.role.Valid(); got != tt.want {
			t.Errorf("UserRole(%q).Valid() = %v, want %v", tt.role, got, tt.want)
		}
	}
}
