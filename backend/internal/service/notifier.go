package service

import (
	"context"

	"github.com/sumatoha/kmf/backend/internal/model"
)

// Notifier sends realtime updates to bots. The HTTP layer / domain calls these
// methods; the bot packages implement them. It's an interface so the domain
// stays decoupled from telegram-bot library types.
type Notifier interface {
	NotifyNewOrder(ctx context.Context, master *model.Master, order *model.Order, svc *model.Service) error
	NotifyOrderConfirmedToClient(ctx context.Context, client *model.Client, order *model.Order, master *model.Master) error
	NotifyOrderStartedToClient(ctx context.Context, client *model.Client, order *model.Order) error
	NotifyOrderCompletedToClient(ctx context.Context, client *model.Client, order *model.Order) error
	NotifyOrderCancelledToMaster(ctx context.Context, master *model.Master, order *model.Order) error
}

// NoopNotifier is a fallback used when bot tokens are not configured.
type NoopNotifier struct{}

func (NoopNotifier) NotifyNewOrder(context.Context, *model.Master, *model.Order, *model.Service) error {
	return nil
}
func (NoopNotifier) NotifyOrderConfirmedToClient(context.Context, *model.Client, *model.Order, *model.Master) error {
	return nil
}
func (NoopNotifier) NotifyOrderStartedToClient(context.Context, *model.Client, *model.Order) error {
	return nil
}
func (NoopNotifier) NotifyOrderCompletedToClient(context.Context, *model.Client, *model.Order) error {
	return nil
}
func (NoopNotifier) NotifyOrderCancelledToMaster(context.Context, *model.Master, *model.Order) error {
	return nil
}
