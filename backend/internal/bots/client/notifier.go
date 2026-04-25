package client

import (
	"context"
	"fmt"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/sumatoha/kmf/backend/internal/bots/shared"
	"github.com/sumatoha/kmf/backend/internal/model"
)

// ClientNotifier implements the client-targeted methods of service.Notifier.
type ClientNotifier struct{ bot *Bot }

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
		Short(o.ID.String()), m.FullName, contact, o.ScheduledAt.Format("02.01.2006 15:04"),
	)
	shared.Send(ctx, n.bot.Logger(), n.bot.Sender(), &bot.SendMessageParams{ChatID: *c.TelegramID, Text: text})
	return nil
}

func (n *ClientNotifier) NotifyOrderStartedToClient(ctx context.Context, c *model.Client, o *model.Order) error {
	if c.TelegramID == nil {
		return nil
	}
	shared.Send(ctx, n.bot.Logger(), n.bot.Sender(), &bot.SendMessageParams{
		ChatID: *c.TelegramID,
		Text:   fmt.Sprintf("🚿 Мастер начал уборку по заказу #%s.", Short(o.ID.String())),
	})
	return nil
}

func (n *ClientNotifier) NotifyOrderCompletedToClient(ctx context.Context, c *model.Client, o *model.Order) error {
	if c.TelegramID == nil {
		return nil
	}
	row := make([]models.InlineKeyboardButton, 0, 5)
	for i := 1; i <= 5; i++ {
		row = append(row, models.InlineKeyboardButton{
			Text: fmt.Sprintf("%d⭐", i), CallbackData: fmt.Sprintf("rate:%s:%d", o.ID, i),
		})
	}
	shared.Send(ctx, n.bot.Logger(), n.bot.Sender(), &bot.SendMessageParams{
		ChatID: *c.TelegramID,
		Text: fmt.Sprintf(
			"✨ Заказ #%s выполнен. Спасибо, что выбрали нас!\nОцените работу мастера:",
			Short(o.ID.String()),
		),
		ReplyMarkup: &models.InlineKeyboardMarkup{InlineKeyboard: [][]models.InlineKeyboardButton{row}},
	})
	return nil
}

func (n *ClientNotifier) NotifyOrderCancelledToMaster(_ context.Context, _ *model.Master, _ *model.Order) error {
	return nil
}
