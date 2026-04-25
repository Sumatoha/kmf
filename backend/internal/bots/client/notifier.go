package client

import (
	"context"
	"fmt"

	"github.com/go-telegram/bot"
	"github.com/sumatoha/kmf/backend/internal/model"
)

// ClientNotifier implements service.Notifier methods that target clients.
// (The Notifier interface combines client + master directions; here we only
// implement the client-targeting methods and stub the rest.)
type ClientNotifier struct {
	bot *Bot
}

func NewNotifier(b *Bot) *ClientNotifier { return &ClientNotifier{bot: b} }

func (n *ClientNotifier) NotifyNewOrder(_ context.Context, _ *model.Master, _ *model.Order, _ *model.Service) error {
	return nil
}

func (n *ClientNotifier) NotifyOrderConfirmedToClient(ctx context.Context, c *model.Client, o *model.Order, m *model.Master) error {
	if c.TelegramID == nil {
		return nil
	}
	contact := ""
	if m.TelegramUsername != nil && *m.TelegramUsername != "" {
		contact = " (@" + *m.TelegramUsername + ")"
	}
	text := fmt.Sprintf(
		"✅ Ваш заказ #%s подтверждён!\nМастер: %s%s\nКогда: %s",
		short(o.ID.String()), m.FullName, contact, o.ScheduledAt.Format("02.01.2006 15:04"),
	)
	_, err := n.bot.SendMessage(ctx, &bot.SendMessageParams{ChatID: *c.TelegramID, Text: text})
	return err
}

func (n *ClientNotifier) NotifyOrderStartedToClient(ctx context.Context, c *model.Client, o *model.Order) error {
	if c.TelegramID == nil {
		return nil
	}
	_, err := n.bot.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: *c.TelegramID,
		Text:   fmt.Sprintf("🚿 Мастер начал уборку по заказу #%s.", short(o.ID.String())),
	})
	return err
}

func (n *ClientNotifier) NotifyOrderCompletedToClient(ctx context.Context, c *model.Client, o *model.Order) error {
	if c.TelegramID == nil {
		return nil
	}
	_, err := n.bot.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: *c.TelegramID,
		Text:   fmt.Sprintf("✨ Заказ #%s выполнен. Спасибо, что выбрали нас!", short(o.ID.String())),
	})
	return err
}

func (n *ClientNotifier) NotifyOrderCancelledToMaster(_ context.Context, _ *model.Master, _ *model.Order) error {
	return nil
}
