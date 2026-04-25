package shared

import (
	"context"
	"log/slog"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

// Sender is the minimal slice of *bot.Bot the bots and notifiers need.
// Defining it as an interface keeps tests easy and bot package boundaries clean.
type Sender interface {
	SendMessage(ctx context.Context, params *bot.SendMessageParams) (*models.Message, error)
	AnswerCallbackQuery(ctx context.Context, params *bot.AnswerCallbackQueryParams) (bool, error)
}

// Send wraps SendMessage with structured error logging so we never silently
// drop a message failure.
func Send(ctx context.Context, log *slog.Logger, s Sender, p *bot.SendMessageParams) {
	if _, err := s.SendMessage(ctx, p); err != nil {
		log.Warn("telegram send failed", "chat_id", p.ChatID, "err", err)
	}
}

// AnswerCB is the equivalent of Send for callback acks.
func AnswerCB(ctx context.Context, log *slog.Logger, s Sender, id string) {
	if _, err := s.AnswerCallbackQuery(ctx, &bot.AnswerCallbackQueryParams{CallbackQueryID: id}); err != nil {
		log.Debug("telegram callback ack failed", "err", err)
	}
}
