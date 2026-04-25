// Package client implements the customer-facing Telegram bot.
//
// Booking flow (FSM stored in bot_sessions):
//
//	idle → choosing_service → choosing_date → choosing_time → awaiting_address
//	      → awaiting_phone (if not set) → confirming → idle
//
// A user enters the bot via /start tenant_<slug>. Without a tenant link the bot
// asks the user to use a company-provided link.
package client

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/sumatoha/kmf/backend/internal/bots/shared"
	botmodel "github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/service"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

type Bot struct {
	b             *bot.Bot
	sessions      *shared.Sessions
	tenants       *storage.TenantRepo
	clients       *storage.ClientRepo
	services      *storage.ServiceRepo
	orders        *service.OrderService
	ordersRepoRef *storage.OrderRepo
	log           *slog.Logger
}

func New(
	token string,
	sessionsRepo *storage.SessionRepo,
	tenants *storage.TenantRepo,
	clients *storage.ClientRepo,
	services *storage.ServiceRepo,
	orders *service.OrderService,
	log *slog.Logger,
) (*Bot, error) {
	cb := &Bot{
		sessions: shared.NewSessions(sessionsRepo, botmodel.BotKindClient),
		tenants:  tenants,
		clients:  clients,
		services: services,
		orders:   orders,
		log:      log,
	}

	b, err := bot.New(token, bot.WithDefaultHandler(cb.defaultHandler))
	if err != nil {
		return nil, fmt.Errorf("init client bot: %w", err)
	}
	cb.b = b

	b.RegisterHandler(bot.HandlerTypeMessageText, "/start", bot.MatchTypePrefix, cb.startHandler)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/cancel", bot.MatchTypeExact, cb.cancelHandler)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/book", bot.MatchTypeExact, cb.bookHandler)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/orders", bot.MatchTypeExact, cb.ordersHandler)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "svc:", bot.MatchTypePrefix, cb.callbackService)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "date:", bot.MatchTypePrefix, cb.callbackDate)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "time:", bot.MatchTypePrefix, cb.callbackTime)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "confirm:", bot.MatchTypePrefix, cb.callbackConfirm)

	return cb, nil
}

// Start begins polling. Cancel ctx to stop.
func (c *Bot) Start(ctx context.Context) {
	c.b.Start(ctx)
}

func (c *Bot) defaultHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	if u.Message == nil || u.Message.From == nil {
		return
	}
	chatID := u.Message.Chat.ID
	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil {
		c.log.Error("load session", "err", err)
		return
	}

	switch snap.State {
	case stateAwaitingAddress:
		c.handleAddress(ctx, b, u, snap)
	case stateAwaitingPhone:
		c.handlePhone(ctx, b, u, snap)
	default:
		// Treat plain messages as nudges to start booking.
		text := strings.TrimSpace(u.Message.Text)
		if text == "" {
			return
		}
		_, _ = b.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: chatID,
			Text:   "Используйте /book чтобы оформить уборку или /orders для просмотра ваших заказов.",
		})
	}
}

func (c *Bot) cancelHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	chatID := u.Message.Chat.ID
	if err := c.sessions.Reset(ctx, chatID); err != nil {
		c.log.Error("reset session", "err", err)
	}
	_, _ = b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: chatID,
		Text:   "Действие отменено. Введите /book чтобы начать заново.",
	})
}

// SendMessage exposes the underlying client for the Notifier implementation.
func (c *Bot) SendMessage(ctx context.Context, params *bot.SendMessageParams) (*models.Message, error) {
	return c.b.SendMessage(ctx, params)
}
