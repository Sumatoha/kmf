package shared

import (
	"context"

	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/service"
)

// CombinedNotifier dispatches each Notifier method to the bot best suited to
// handle it: master-targeted notifications go to the master bot, client-targeted
// ones go to the client bot. Either side may be nil (e.g. token not configured),
// in which case those events become no-ops.
type CombinedNotifier struct {
	Client service.Notifier
	Master service.Notifier
}

func (c *CombinedNotifier) NotifyNewOrder(ctx context.Context, m *model.Master, o *model.Order, s *model.Service) error {
	if c.Master == nil {
		return nil
	}
	return c.Master.NotifyNewOrder(ctx, m, o, s)
}

func (c *CombinedNotifier) NotifyOrderConfirmedToClient(ctx context.Context, cl *model.Client, o *model.Order, m *model.Master) error {
	if c.Client == nil {
		return nil
	}
	return c.Client.NotifyOrderConfirmedToClient(ctx, cl, o, m)
}

func (c *CombinedNotifier) NotifyOrderStartedToClient(ctx context.Context, cl *model.Client, o *model.Order) error {
	if c.Client == nil {
		return nil
	}
	return c.Client.NotifyOrderStartedToClient(ctx, cl, o)
}

func (c *CombinedNotifier) NotifyOrderCompletedToClient(ctx context.Context, cl *model.Client, o *model.Order) error {
	if c.Client == nil {
		return nil
	}
	return c.Client.NotifyOrderCompletedToClient(ctx, cl, o)
}

func (c *CombinedNotifier) NotifyOrderCancelledToMaster(ctx context.Context, m *model.Master, o *model.Order) error {
	if c.Master == nil {
		return nil
	}
	return c.Master.NotifyOrderCancelledToMaster(ctx, m, o)
}
