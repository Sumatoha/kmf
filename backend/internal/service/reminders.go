package service

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/sumatoha/kmf/backend/internal/storage"
)

// RemindersService scans for upcoming orders and notifies the client and the
// assigned master one hour before the scheduled time. The window is configurable
// for tests / shorter cycles.
type RemindersService struct {
	orders   *storage.OrderRepo
	clients  *storage.ClientRepo
	masters  *storage.MasterRepo
	notifier Notifier
	hooks    *WebhookService
	log      *slog.Logger

	Lead     time.Duration // notify when scheduled_at is within this window
	Interval time.Duration // how often to scan
}

func NewRemindersService(
	orders *storage.OrderRepo,
	clients *storage.ClientRepo,
	masters *storage.MasterRepo,
	notifier Notifier,
	hooks *WebhookService,
	log *slog.Logger,
) *RemindersService {
	if notifier == nil {
		notifier = NoopNotifier{}
	}
	return &RemindersService{
		orders: orders, clients: clients, masters: masters,
		notifier: notifier, hooks: hooks, log: log,
		Lead:     time.Hour,
		Interval: time.Minute,
	}
}

// Run scans every Interval until ctx is cancelled.
func (r *RemindersService) Run(ctx context.Context) {
	tick := time.NewTicker(r.Interval)
	defer tick.Stop()
	r.tick(ctx) // run once on start so newly-scheduled orders aren't waiting a minute
	for {
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
			r.tick(ctx)
		}
	}
}

func (r *RemindersService) tick(ctx context.Context) {
	orders, err := r.orders.ListNeedingReminder(ctx, r.Lead)
	if err != nil {
		r.log.Warn("reminders: list", "err", err)
		return
	}
	for _, o := range orders {
		client, err := r.clients.GetByID(ctx, o.TenantID, o.ClientID)
		if err == nil {
			text := fmt.Sprintf("⏰ Напоминание: уборка #%s через час, в %s",
				shortID(o.ID.String()), o.ScheduledAt.Format("15:04"))
			r.notifier.NotifyClientText(ctx, client, text)
		}
		if o.MasterID != nil {
			m, err := r.masters.GetByID(ctx, o.TenantID, *o.MasterID)
			if err == nil {
				text := fmt.Sprintf("⏰ Через час — заказ #%s по адресу: %s",
					shortID(o.ID.String()), o.AddressText)
				r.notifier.NotifyMasterText(ctx, m, text)
			}
		}
		if err := r.orders.MarkReminded(ctx, o.TenantID, o.ID); err != nil {
			r.log.Warn("reminders: mark", "order_id", o.ID, "err", err)
		}
	}
}

func shortID(id string) string {
	if len(id) > 8 {
		return id[:8]
	}
	return id
}
