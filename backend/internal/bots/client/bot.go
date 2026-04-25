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
	b        *bot.Bot
	sessions *shared.Sessions
	tenants  *storage.TenantRepo
	clients  *storage.ClientRepo
	services *storage.ServiceRepo
	ordersR  *storage.OrderRepo
	orders   *service.OrderService
	log      *slog.Logger
}

type Deps struct {
	Token    string
	Sessions *storage.SessionRepo
	Tenants  *storage.TenantRepo
	Clients  *storage.ClientRepo
	Services *storage.ServiceRepo
	OrdersR  *storage.OrderRepo
	Orders   *service.OrderService
	Log      *slog.Logger
}

func New(d Deps) (*Bot, error) {
	cb := &Bot{
		sessions: shared.NewSessions(d.Sessions, botmodel.BotKindClient),
		tenants:  d.Tenants,
		clients:  d.Clients,
		services: d.Services,
		ordersR:  d.OrdersR,
		orders:   d.Orders,
		log:      d.Log,
	}

	b, err := bot.New(d.Token, bot.WithDefaultHandler(cb.defaultHandler))
	if err != nil {
		return nil, fmt.Errorf("init client bot: %w", err)
	}
	cb.b = b

	b.RegisterHandler(bot.HandlerTypeMessageText, "/start", bot.MatchTypePrefix, cb.startHandler)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/cancel", bot.MatchTypeExact, cb.cancelHandler)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/book", bot.MatchTypeExact, cb.bookHandler)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/orders", bot.MatchTypeExact, cb.ordersHandler)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/help", bot.MatchTypeExact, cb.helpHandler)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "svc:", bot.MatchTypePrefix, cb.callbackService)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "date:", bot.MatchTypePrefix, cb.callbackDate)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "time:", bot.MatchTypePrefix, cb.callbackTime)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "confirm:", bot.MatchTypePrefix, cb.callbackConfirm)
	b.RegisterHandler(bot.HandlerTypeCallbackQueryData, "rate:", bot.MatchTypePrefix, cb.callbackRate)

	return cb, nil
}

// Start begins polling. Cancel ctx to stop.
func (c *Bot) Start(ctx context.Context) {
	c.b.Start(ctx)
}

// Sender exposes the raw bot for the notifier package.
func (c *Bot) Sender() shared.Sender { return c.b }

// Logger gives the notifier access to the same scoped logger.
func (c *Bot) Logger() *slog.Logger { return c.log }

func (c *Bot) defaultHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	if u.Message == nil || u.Message.From == nil {
		return
	}
	chatID := u.Message.Chat.ID
	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil {
		c.log.Error("load session", "chat_id", chatID, "err", err)
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{
			ChatID: chatID, Text: "Что-то пошло не так. Попробуйте /book чтобы начать заново.",
		})
		return
	}

	switch snap.State {
	case stateAwaitingAddress:
		c.handleAddress(ctx, b, u, snap)
	case stateAwaitingPhone:
		c.handlePhone(ctx, b, u, snap)
	default:
		text := strings.TrimSpace(u.Message.Text)
		if text == "" {
			return
		}
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{
			ChatID: chatID,
			Text:   "Используйте /book чтобы оформить уборку или /orders для просмотра ваших заказов.",
		})
	}
}

func (c *Bot) cancelHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	chatID := u.Message.Chat.ID
	if err := c.sessions.Reset(ctx, chatID); err != nil {
		c.log.Warn("reset session", "chat_id", chatID, "err", err)
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID,
		Text:   "Действие отменено. Введите /book чтобы начать заново.",
	})
}

func (c *Bot) helpHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: u.Message.Chat.ID,
		Text: "Команды:\n" +
			"/book — записаться на уборку\n" +
			"/orders — мои заказы\n" +
			"/cancel — отменить текущее действие",
	})
}
