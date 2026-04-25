package service

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/google/uuid"

	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

var (
	ErrServiceNotFound = errors.New("service not found")
	ErrOrderNotFound   = errors.New("order not found")
	ErrInvalidState    = errors.New("invalid order state for this action")
)

type OrderService struct {
	orders   *storage.OrderRepo
	clients  *storage.ClientRepo
	masters  *storage.MasterRepo
	services *storage.ServiceRepo
	reviews  *storage.ReviewRepo
	notifier Notifier
	hooks    *WebhookService
	log      *slog.Logger
}

func NewOrderService(
	orders *storage.OrderRepo,
	clients *storage.ClientRepo,
	masters *storage.MasterRepo,
	services *storage.ServiceRepo,
	reviews *storage.ReviewRepo,
	notifier Notifier,
	hooks *WebhookService,
	log *slog.Logger,
) *OrderService {
	if notifier == nil {
		notifier = NoopNotifier{}
	}
	return &OrderService{
		orders: orders, clients: clients, masters: masters, services: services,
		reviews: reviews, notifier: notifier, hooks: hooks, log: log,
	}
}

func (s *OrderService) SetNotifier(n Notifier) { s.notifier = n }

func (s *OrderService) emit(tenantID uuid.UUID, event string, payload any) {
	if s.hooks == nil {
		return
	}
	go s.hooks.Enqueue(context.Background(), tenantID, event, payload)
}

type CreateOrderInput struct {
	TenantID    uuid.UUID
	ClientID    uuid.UUID
	ServiceID   uuid.UUID
	AddressText string
	ScheduledAt time.Time
	Notes       *string
}

// Create books a new order and broadcasts it to available masters.
func (s *OrderService) Create(ctx context.Context, in CreateOrderInput) (*model.Order, error) {
	svc, err := s.services.GetByID(ctx, in.ServiceID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrServiceNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get service: %w", err)
	}
	if svc.TenantID != in.TenantID {
		return nil, ErrServiceNotFound
	}

	order, err := s.orders.Create(ctx, storage.CreateOrderParams{
		TenantID:    in.TenantID,
		ClientID:    in.ClientID,
		ServiceID:   in.ServiceID,
		AddressText: in.AddressText,
		ScheduledAt: in.ScheduledAt,
		Price:       svc.BasePrice,
		Notes:       in.Notes,
	})
	if err != nil {
		return nil, fmt.Errorf("create order: %w", err)
	}

	go s.broadcastToMasters(context.Background(), order, svc)
	s.emit(order.TenantID, EventOrderCreated, order)
	return order, nil
}

// CreateManual is invoked by an admin to create an order on behalf of a client
// who phoned in. clientID may be nil — in that case phone/fullName are used to
// upsert a non-Telegram client. masterID may be nil (broadcast as usual) or set
// (assigned directly).
type CreateManualOrderInput struct {
	TenantID    uuid.UUID
	ClientID    *uuid.UUID
	ClientPhone *string
	ClientName  *string
	ServiceID   uuid.UUID
	AddressText string
	ScheduledAt time.Time
	Notes       *string
	MasterID    *uuid.UUID
}

func (s *OrderService) CreateManual(ctx context.Context, in CreateManualOrderInput) (*model.Order, error) {
	clientID := uuid.Nil
	if in.ClientID != nil {
		clientID = *in.ClientID
	} else if in.ClientPhone != nil && *in.ClientPhone != "" {
		c, err := s.clients.UpsertByPhone(ctx, in.TenantID, *in.ClientPhone, in.ClientName)
		if err != nil {
			return nil, fmt.Errorf("upsert client: %w", err)
		}
		clientID = c.ID
	} else {
		return nil, fmt.Errorf("client_id or client_phone is required")
	}

	order, err := s.Create(ctx, CreateOrderInput{
		TenantID:    in.TenantID,
		ClientID:    clientID,
		ServiceID:   in.ServiceID,
		AddressText: in.AddressText,
		ScheduledAt: in.ScheduledAt,
		Notes:       in.Notes,
	})
	if err != nil {
		return nil, err
	}
	if in.MasterID != nil {
		assigned, err := s.AssignByAdmin(ctx, order.ID, *in.MasterID)
		if err != nil {
			s.log.Warn("manual create: assign", "err", err)
			return order, nil
		}
		return assigned, nil
	}
	return order, nil
}

// broadcastToMasters notifies every available master in the tenant about a new
// unassigned order. The first master who accepts wins (atomically via Assign).
func (s *OrderService) broadcastToMasters(ctx context.Context, order *model.Order, svc *model.Service) {
	masters, err := s.masters.ListAvailable(ctx, order.TenantID)
	if err != nil {
		s.log.Error("list available masters", "err", err)
		return
	}
	for _, m := range masters {
		if err := s.notifier.NotifyNewOrder(ctx, m, order, svc); err != nil {
			s.log.Warn("notify master", "master_id", m.ID, "err", err)
		}
	}
}

// AssignByAdmin manually assigns a master to an order from the CRM, then
// notifies the master and the client. Bypasses the broadcast/race flow.
func (s *OrderService) AssignByAdmin(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	master, err := s.masters.GetByID(ctx, masterID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrInvalidState
	}
	if err != nil {
		return nil, fmt.Errorf("get master: %w", err)
	}
	order, err := s.orders.AssignByAdmin(ctx, orderID, masterID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrInvalidState
	}
	if err != nil {
		return nil, fmt.Errorf("assign by admin: %w", err)
	}
	if order.TenantID != master.TenantID {
		return nil, ErrInvalidState
	}

	go func(ctx context.Context) {
		svc, err := s.services.GetByID(ctx, order.ServiceID)
		if err != nil {
			s.log.Warn("notify assigned: load service", "err", err)
			return
		}
		if err := s.notifier.NotifyNewOrder(ctx, master, order, svc); err != nil {
			s.log.Warn("notify assigned master", "err", err)
		}
	}(context.Background())
	return order, nil
}

// AcceptByMaster atomically claims an order for a master. Handles two cases:
//
//  1. status=new — broadcast flow: first to claim wins; we Assign then Confirm.
//  2. status=assigned & master_id=us — admin pre-assigned this master; just Confirm.
//
// Returns ErrInvalidState if another master already grabbed it or it's terminal.
func (s *OrderService) AcceptByMaster(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	current, err := s.orders.GetByID(ctx, orderID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrOrderNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get order: %w", err)
	}

	switch current.Status {
	case model.OrderStatusNew:
		assigned, err := s.orders.Assign(ctx, orderID, masterID)
		if errors.Is(err, storage.ErrNotFound) {
			return nil, ErrInvalidState
		}
		if err != nil {
			return nil, fmt.Errorf("assign: %w", err)
		}
		confirmed, err := s.orders.Confirm(ctx, assigned.ID, masterID)
		if err != nil {
			return assigned, fmt.Errorf("confirm: %w", err)
		}
		s.notifyClient(ctx, confirmed, masterID)
		s.emit(confirmed.TenantID, EventOrderConfirmed, confirmed)
		return confirmed, nil

	case model.OrderStatusAssigned:
		if current.MasterID == nil || *current.MasterID != masterID {
			return nil, ErrInvalidState
		}
		confirmed, err := s.orders.Confirm(ctx, orderID, masterID)
		if err != nil {
			return nil, fmt.Errorf("confirm: %w", err)
		}
		s.notifyClient(ctx, confirmed, masterID)
		s.emit(confirmed.TenantID, EventOrderConfirmed, confirmed)
		return confirmed, nil

	default:
		return nil, ErrInvalidState
	}
}

func (s *OrderService) notifyClient(ctx context.Context, order *model.Order, masterID uuid.UUID) {
	client, err := s.clients.GetByID(ctx, order.ClientID)
	if err != nil {
		s.log.Warn("notify client: load client", "err", err)
		return
	}
	master, err := s.masters.GetByID(ctx, masterID)
	if err != nil {
		s.log.Warn("notify client: load master", "err", err)
		return
	}
	if err := s.notifier.NotifyOrderConfirmedToClient(ctx, client, order, master); err != nil {
		s.log.Warn("notify client confirmed", "err", err)
	}
}

func (s *OrderService) Start(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	order, err := s.orders.Start(ctx, orderID, masterID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrInvalidState
	}
	if err != nil {
		return nil, err
	}
	if client, err := s.clients.GetByID(ctx, order.ClientID); err == nil {
		_ = s.notifier.NotifyOrderStartedToClient(ctx, client, order)
	}
	s.emit(order.TenantID, EventOrderStarted, order)
	return order, nil
}

func (s *OrderService) Complete(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	order, err := s.orders.Complete(ctx, orderID, masterID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrInvalidState
	}
	if err != nil {
		return nil, err
	}
	if err := s.masters.IncrementCompletedAndUpdateRating(ctx, masterID); err != nil {
		s.log.Warn("update master stats", "err", err)
	}
	if client, err := s.clients.GetByID(ctx, order.ClientID); err == nil {
		_ = s.notifier.NotifyOrderCompletedToClient(ctx, client, order)
	}
	s.emit(order.TenantID, EventOrderCompleted, order)
	return order, nil
}

func (s *OrderService) Cancel(ctx context.Context, orderID uuid.UUID, reason string) (*model.Order, error) {
	order, err := s.orders.Cancel(ctx, orderID, reason)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrInvalidState
	}
	if err != nil {
		return nil, err
	}
	if order.MasterID != nil {
		if m, err := s.masters.GetByID(ctx, *order.MasterID); err == nil {
			_ = s.notifier.NotifyOrderCancelledToMaster(ctx, m, order)
		}
	}
	s.emit(order.TenantID, EventOrderCancelled, order)
	return order, nil
}

type SubmitReviewInput struct {
	OrderID  uuid.UUID
	ClientID uuid.UUID
	Rating   int
	Comment  *string
}

func (s *OrderService) SubmitReview(ctx context.Context, in SubmitReviewInput) (*model.Review, error) {
	order, err := s.orders.GetByID(ctx, in.OrderID)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrOrderNotFound
	}
	if err != nil {
		return nil, err
	}
	if order.ClientID != in.ClientID {
		return nil, ErrOrderNotFound
	}
	if order.Status != model.OrderStatusDone {
		return nil, ErrInvalidState
	}
	review, err := s.reviews.Create(ctx, order.TenantID, order.ID, order.ClientID, order.MasterID, in.Rating, in.Comment)
	if err != nil {
		return nil, err
	}
	if order.MasterID != nil {
		_ = s.masters.IncrementCompletedAndUpdateRating(ctx, *order.MasterID)
	}
	s.emit(review.TenantID, EventReviewCreated, review)
	return review, nil
}
