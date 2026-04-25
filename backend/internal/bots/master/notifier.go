package master

import (
	"context"
	"fmt"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/sumatoha/kmf/backend/internal/model"
)

// MasterNotifier sends order events to masters.
type MasterNotifier struct{ bot *Bot }

func NewNotifier(b *Bot) *MasterNotifier { return &MasterNotifier{bot: b} }

func (n *MasterNotifier) NotifyNewOrder(ctx context.Context, m *model.Master, o *model.Order, svc *model.Service) error {
	if m.TelegramID == nil {
		return nil
	}
	text := fmt.Sprintf(
		"🆕 Новый заказ!\n\n*%s* — %.0f ₽\nКогда: %s\nАдрес: %s",
		svc.Name, o.Price, o.ScheduledAt.Format("02.01.2006 15:04"), o.AddressText,
	)
	rows := [][]models.InlineKeyboardButton{{
		{Text: "✅ Взять", CallbackData: fmt.Sprintf("ord:accept:%s", o.ID)},
		{Text: "⏭️ Пропустить", CallbackData: fmt.Sprintf("ord:decline:%s", o.ID)},
	}}
	_, err := n.bot.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: *m.TelegramID, Text: text, ParseMode: models.ParseModeMarkdown,
		ReplyMarkup: &models.InlineKeyboardMarkup{InlineKeyboard: rows},
	})
	return err
}

func (n *MasterNotifier) NotifyOrderConfirmedToClient(_ context.Context, _ *model.Client, _ *model.Order, _ *model.Master) error {
	return nil
}
func (n *MasterNotifier) NotifyOrderStartedToClient(_ context.Context, _ *model.Client, _ *model.Order) error {
	return nil
}
func (n *MasterNotifier) NotifyOrderCompletedToClient(_ context.Context, _ *model.Client, _ *model.Order) error {
	return nil
}

func (n *MasterNotifier) NotifyOrderCancelledToMaster(ctx context.Context, m *model.Master, o *model.Order) error {
	if m.TelegramID == nil {
		return nil
	}
	_, err := n.bot.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: *m.TelegramID,
		Text:   fmt.Sprintf("⚠️ Заказ #%s был отменён.", short(o.ID.String())),
	})
	return err
}
