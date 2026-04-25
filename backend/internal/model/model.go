package model

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string

const (
	RoleOwner      UserRole = "owner"
	RoleAdmin      UserRole = "admin"
	RoleDispatcher UserRole = "dispatcher"
)

type OrderStatus string

const (
	OrderStatusNew        OrderStatus = "new"
	OrderStatusAssigned   OrderStatus = "assigned"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusInProgress OrderStatus = "in_progress"
	OrderStatusDone       OrderStatus = "done"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type BotKind string

const (
	BotKindClient BotKind = "client"
	BotKindMaster BotKind = "master"
)

type Tenant struct {
	ID        uuid.UUID `json:"id"`
	Slug      string    `json:"slug"`
	Name      string    `json:"name"`
	Timezone  string    `json:"timezone"`
	Currency  string    `json:"currency"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type User struct {
	ID           uuid.UUID `json:"id"`
	TenantID     uuid.UUID `json:"tenant_id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Role         UserRole  `json:"role"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Master struct {
	ID                uuid.UUID  `json:"id"`
	TenantID          uuid.UUID  `json:"tenant_id"`
	TelegramID        *int64     `json:"telegram_id,omitempty"`
	TelegramUsername  *string    `json:"telegram_username,omitempty"`
	FullName          string     `json:"full_name"`
	Phone             *string    `json:"phone,omitempty"`
	Rating            float64    `json:"rating"`
	CompletedOrders   int        `json:"completed_orders"`
	IsActive          bool       `json:"is_active"`
	IsAvailable       bool       `json:"is_available"`
	InviteToken       *string    `json:"invite_token,omitempty"`
	InvitedAt         *time.Time `json:"invited_at,omitempty"`
	ActivatedAt       *time.Time `json:"activated_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

type Client struct {
	ID               uuid.UUID `json:"id"`
	TenantID         uuid.UUID `json:"tenant_id"`
	TelegramID       *int64    `json:"telegram_id,omitempty"`
	TelegramUsername *string   `json:"telegram_username,omitempty"`
	FullName         *string   `json:"full_name,omitempty"`
	Phone            *string   `json:"phone,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Service struct {
	ID              uuid.UUID `json:"id"`
	TenantID        uuid.UUID `json:"tenant_id"`
	Name            string    `json:"name"`
	Description     *string   `json:"description,omitempty"`
	BasePrice       float64   `json:"base_price"`
	DurationMinutes int       `json:"duration_minutes"`
	IsActive        bool      `json:"is_active"`
	SortOrder       int       `json:"sort_order"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Order struct {
	ID                 uuid.UUID      `json:"id"`
	TenantID           uuid.UUID      `json:"tenant_id"`
	ClientID           uuid.UUID      `json:"client_id"`
	ServiceID          uuid.UUID      `json:"service_id"`
	MasterID           *uuid.UUID     `json:"master_id,omitempty"`
	AddressText        string         `json:"address_text"`
	ScheduledAt        time.Time      `json:"scheduled_at"`
	Status             OrderStatus    `json:"status"`
	Price              float64        `json:"price"`
	Notes              *string        `json:"notes,omitempty"`
	CancellationReason *string        `json:"cancellation_reason,omitempty"`
	AssignedAt         *time.Time     `json:"assigned_at,omitempty"`
	ConfirmedAt        *time.Time     `json:"confirmed_at,omitempty"`
	StartedAt          *time.Time     `json:"started_at,omitempty"`
	CompletedAt        *time.Time     `json:"completed_at,omitempty"`
	CancelledAt        *time.Time     `json:"cancelled_at,omitempty"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
}

type Review struct {
	ID        uuid.UUID  `json:"id"`
	TenantID  uuid.UUID  `json:"tenant_id"`
	OrderID   uuid.UUID  `json:"order_id"`
	ClientID  uuid.UUID  `json:"client_id"`
	MasterID  *uuid.UUID `json:"master_id,omitempty"`
	Rating    int        `json:"rating"`
	Comment   *string    `json:"comment,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

type BotSession struct {
	ID        uuid.UUID  `json:"id"`
	Kind      BotKind    `json:"kind"`
	ChatID    int64      `json:"chat_id"`
	TenantID  *uuid.UUID `json:"tenant_id,omitempty"`
	State     string     `json:"state"`
	Data      []byte     `json:"data"`
	UpdatedAt time.Time  `json:"updated_at"`
}
