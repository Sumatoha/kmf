package client

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/bots/shared"
	"github.com/sumatoha/kmf/backend/internal/service"
)

const (
	stateIdle            = "idle"
	stateChoosingService = "choosing_service"
	stateChoosingDate    = "choosing_date"
	stateChoosingTime    = "choosing_time"
	stateAwaitingAddress = "awaiting_address"
	stateAwaitingPhone   = "awaiting_phone"
	stateConfirming      = "confirming"
)

const tenantPrefix = "tenant_"

func (c *Bot) startHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	if u.Message == nil || u.Message.From == nil {
		return
	}
	chatID := u.Message.Chat.ID
	from := u.Message.From

	args := strings.TrimSpace(strings.TrimPrefix(u.Message.Text, "/start"))

	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil {
		c.log.Error("load session", "chat_id", chatID, "err", err)
		return
	}

	if strings.HasPrefix(args, tenantPrefix) {
		slug := strings.TrimPrefix(args, tenantPrefix)
		tenant, err := c.tenants.GetBySlug(ctx, slug)
		if err != nil {
			c.log.Info("tenant lookup failed", "slug", slug, "err", err)
			shared.Send(ctx, c.log, b, &bot.SendMessageParams{
				ChatID: chatID, Text: "Компания не найдена. Уточните ссылку у компании.",
			})
			return
		}
		snap.TenantID = &tenant.ID
		snap.State = stateIdle
		if err := c.sessions.Save(ctx, chatID, snap); err != nil {
			c.log.Error("save session", "chat_id", chatID, "err", err)
		}
		fullName := strings.TrimSpace(from.FirstName + " " + from.LastName)
		var fnPtr *string
		if fullName != "" {
			fnPtr = &fullName
		}
		var unPtr *string
		if from.Username != "" {
			u := from.Username
			unPtr = &u
		}
		if _, err := c.clients.UpsertByTelegram(ctx, tenant.ID, from.ID, unPtr, fnPtr); err != nil {
			c.log.Error("upsert client", "tenant_id", tenant.ID, "tg_id", from.ID, "err", err)
		}
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{
			ChatID: chatID,
			Text:   fmt.Sprintf("Добро пожаловать в %s! Нажмите /book чтобы оформить уборку.", tenant.Name),
		})
		return
	}

	if snap.TenantID == nil {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{
			ChatID: chatID,
			Text:   "Откройте бота по ссылке от вашей клининговой компании, например t.me/CleanOpsBookingBot?start=tenant_demo",
		})
		return
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID,
		Text:   "С возвращением! /book — новая запись, /orders — мои заказы.",
	})
}

func (c *Bot) bookHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	chatID := u.Message.Chat.ID
	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil || snap.TenantID == nil {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{
			ChatID: chatID, Text: "Сначала откройте бота по ссылке от компании.",
		})
		return
	}
	c.askService(ctx, b, chatID, snap)
}

func (c *Bot) askService(ctx context.Context, b *bot.Bot, chatID int64, snap *shared.Snapshot) {
	items, err := c.services.ListActive(ctx, *snap.TenantID)
	if err != nil {
		c.log.Error("list services", "tenant_id", *snap.TenantID, "err", err)
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Не удалось загрузить услуги, попробуйте позже."})
		return
	}
	if len(items) == 0 {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{
			ChatID: chatID, Text: "У компании пока нет доступных услуг. Попробуйте позже.",
		})
		return
	}
	rows := make([][]models.InlineKeyboardButton, 0, len(items))
	for _, s := range items {
		label := fmt.Sprintf("%s — %.0f ₽", s.Name, s.BasePrice)
		rows = append(rows, []models.InlineKeyboardButton{{Text: label, CallbackData: "svc:" + s.ID.String()}})
	}
	snap.State = stateChoosingService
	if err := c.sessions.Save(ctx, chatID, snap); err != nil {
		c.log.Error("save session", "chat_id", chatID, "err", err)
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID, Text: "Выберите услугу:",
		ReplyMarkup: &models.InlineKeyboardMarkup{InlineKeyboard: rows},
	})
}

func (c *Bot) callbackService(ctx context.Context, b *bot.Bot, u *models.Update) {
	cq := u.CallbackQuery
	if cq == nil {
		return
	}
	chatID := cq.Message.Message.Chat.ID
	shared.AnswerCB(ctx, c.log, b, cq.ID)

	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil {
		c.log.Error("load session", "chat_id", chatID, "err", err)
		return
	}
	if snap.State != stateChoosingService {
		return
	}
	id := strings.TrimPrefix(cq.Data, "svc:")
	snap.Data["service_id"] = id
	snap.State = stateChoosingDate
	if err := c.sessions.Save(ctx, chatID, snap); err != nil {
		c.log.Error("save session", "chat_id", chatID, "err", err)
	}
	c.askDate(ctx, b, chatID)
}

func (c *Bot) askDate(ctx context.Context, b *bot.Bot, chatID int64) {
	now := time.Now()
	rows := make([][]models.InlineKeyboardButton, 0, 7)
	for i := 0; i < 7; i++ {
		d := now.AddDate(0, 0, i)
		label := d.Format("Mon 02.01")
		rows = append(rows, []models.InlineKeyboardButton{{
			Text: label, CallbackData: "date:" + d.Format("2006-01-02"),
		}})
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID, Text: "Выберите дату:",
		ReplyMarkup: &models.InlineKeyboardMarkup{InlineKeyboard: rows},
	})
}

func (c *Bot) callbackDate(ctx context.Context, b *bot.Bot, u *models.Update) {
	cq := u.CallbackQuery
	if cq == nil {
		return
	}
	chatID := cq.Message.Message.Chat.ID
	shared.AnswerCB(ctx, c.log, b, cq.ID)

	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil {
		c.log.Error("load session", "chat_id", chatID, "err", err)
		return
	}
	if snap.State != stateChoosingDate {
		return
	}
	snap.Data["date"] = strings.TrimPrefix(cq.Data, "date:")
	snap.State = stateChoosingTime
	if err := c.sessions.Save(ctx, chatID, snap); err != nil {
		c.log.Error("save session", "chat_id", chatID, "err", err)
	}
	c.askTime(ctx, b, chatID)
}

func (c *Bot) askTime(ctx context.Context, b *bot.Bot, chatID int64) {
	hours := []int{8, 10, 12, 14, 16, 18}
	rows := make([][]models.InlineKeyboardButton, 0, 3)
	row := []models.InlineKeyboardButton{}
	for i, h := range hours {
		label := fmt.Sprintf("%02d:00", h)
		row = append(row, models.InlineKeyboardButton{Text: label, CallbackData: "time:" + strconv.Itoa(h)})
		if (i+1)%3 == 0 {
			rows = append(rows, row)
			row = nil
		}
	}
	if len(row) > 0 {
		rows = append(rows, row)
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID, Text: "Выберите время:",
		ReplyMarkup: &models.InlineKeyboardMarkup{InlineKeyboard: rows},
	})
}

func (c *Bot) callbackTime(ctx context.Context, b *bot.Bot, u *models.Update) {
	cq := u.CallbackQuery
	if cq == nil {
		return
	}
	chatID := cq.Message.Message.Chat.ID
	shared.AnswerCB(ctx, c.log, b, cq.ID)

	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil {
		c.log.Error("load session", "chat_id", chatID, "err", err)
		return
	}
	if snap.State != stateChoosingTime {
		return
	}
	snap.Data["hour"] = strings.TrimPrefix(cq.Data, "time:")
	snap.State = stateAwaitingAddress
	if err := c.sessions.Save(ctx, chatID, snap); err != nil {
		c.log.Error("save session", "chat_id", chatID, "err", err)
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID, Text: "Укажите адрес уборки одним сообщением (улица, дом, квартира):",
	})
}

func (c *Bot) handleAddress(ctx context.Context, b *bot.Bot, u *models.Update, snap *shared.Snapshot) {
	chatID := u.Message.Chat.ID
	addr := strings.TrimSpace(u.Message.Text)
	if len(addr) < 5 {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Адрес слишком короткий, попробуйте ещё раз:"})
		return
	}
	snap.Data["address"] = addr

	if snap.TenantID == nil {
		return
	}
	cli, err := c.clients.GetByTelegram(ctx, *snap.TenantID, u.Message.From.ID)
	if err != nil {
		c.log.Error("get client", "tenant_id", *snap.TenantID, "tg_id", u.Message.From.ID, "err", err)
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Что-то пошло не так. Введите /start tenant_<код> заново."})
		return
	}
	if cli.Phone == nil || *cli.Phone == "" {
		snap.State = stateAwaitingPhone
		if err := c.sessions.Save(ctx, chatID, snap); err != nil {
			c.log.Error("save session", "chat_id", chatID, "err", err)
		}
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{
			ChatID: chatID, Text: "Укажите ваш телефон (например, +7 900 000-00-00):",
		})
		return
	}
	snap.State = stateConfirming
	if err := c.sessions.Save(ctx, chatID, snap); err != nil {
		c.log.Error("save session", "chat_id", chatID, "err", err)
	}
	c.showConfirmation(ctx, b, chatID, snap)
}

func (c *Bot) handlePhone(ctx context.Context, b *bot.Bot, u *models.Update, snap *shared.Snapshot) {
	chatID := u.Message.Chat.ID
	phone := sanitizePhone(strings.TrimSpace(u.Message.Text))
	if len(phone) < 6 || len(phone) > 20 {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Неверный формат телефона. Пример: +7 900 000-00-00"})
		return
	}
	if snap.TenantID == nil {
		return
	}
	cli, err := c.clients.GetByTelegram(ctx, *snap.TenantID, u.Message.From.ID)
	if err != nil {
		c.log.Error("get client", "err", err)
		return
	}
	if err := c.clients.UpdateContact(ctx, *snap.TenantID, cli.ID, nil, &phone); err != nil {
		c.log.Error("update contact", "client_id", cli.ID, "err", err)
	}
	snap.State = stateConfirming
	if err := c.sessions.Save(ctx, chatID, snap); err != nil {
		c.log.Error("save session", "chat_id", chatID, "err", err)
	}
	c.showConfirmation(ctx, b, chatID, snap)
}

func (c *Bot) showConfirmation(ctx context.Context, b *bot.Bot, chatID int64, snap *shared.Snapshot) {
	svcID, _ := snap.Data["service_id"].(string)
	dateStr, _ := snap.Data["date"].(string)
	hourStr, _ := snap.Data["hour"].(string)
	addr, _ := snap.Data["address"].(string)

	svcUUID, err := uuid.Parse(svcID)
	if err != nil {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Сессия истекла, введите /book чтобы начать заново."})
		return
	}
	svc, err := c.services.GetByID(ctx, *snap.TenantID, svcUUID)
	if err != nil {
		c.log.Error("get service", "service_id", svcUUID, "err", err)
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Услуга недоступна. Введите /book заново."})
		return
	}
	tz := ""
	if tenant, err := c.tenants.GetByID(ctx, *snap.TenantID); err == nil {
		tz = tenant.Timezone
	}
	scheduled, err := parseScheduled(dateStr, hourStr, tz)
	if err != nil {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Неверная дата/время, попробуйте /book снова."})
		return
	}
	text := fmt.Sprintf(
		"Подтвердите заказ:\n\n*Услуга:* %s\n*Стоимость:* %.0f ₽\n*Когда:* %s\n*Адрес:* %s",
		svc.Name, svc.BasePrice, scheduled.Format("02.01.2006 15:04"), addr,
	)
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID, Text: text, ParseMode: models.ParseModeMarkdown,
		ReplyMarkup: &models.InlineKeyboardMarkup{InlineKeyboard: [][]models.InlineKeyboardButton{
			{
				{Text: "✅ Подтвердить", CallbackData: "confirm:yes"},
				{Text: "❌ Отмена", CallbackData: "confirm:no"},
			},
		}},
	})
}

func (c *Bot) callbackConfirm(ctx context.Context, b *bot.Bot, u *models.Update) {
	cq := u.CallbackQuery
	if cq == nil {
		return
	}
	chatID := cq.Message.Message.Chat.ID
	shared.AnswerCB(ctx, c.log, b, cq.ID)

	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil {
		c.log.Error("load session", "chat_id", chatID, "err", err)
		return
	}
	if snap.State != stateConfirming {
		return
	}
	if strings.TrimPrefix(cq.Data, "confirm:") == "no" {
		if err := c.sessions.Reset(ctx, chatID); err != nil {
			c.log.Warn("reset session", "chat_id", chatID, "err", err)
		}
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Заказ отменён."})
		return
	}

	if snap.TenantID == nil {
		return
	}
	svcID, _ := snap.Data["service_id"].(string)
	dateStr, _ := snap.Data["date"].(string)
	hourStr, _ := snap.Data["hour"].(string)
	addr, _ := snap.Data["address"].(string)

	tz := ""
	if tenant, err := c.tenants.GetByID(ctx, *snap.TenantID); err == nil {
		tz = tenant.Timezone
	}
	scheduled, err := parseScheduled(dateStr, hourStr, tz)
	if err != nil {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Что-то пошло не так. Попробуйте /book снова."})
		return
	}
	svcUUID, err := uuid.Parse(svcID)
	if err != nil {
		return
	}
	cli, err := c.clients.GetByTelegram(ctx, *snap.TenantID, cq.From.ID)
	if err != nil {
		c.log.Error("get client", "err", err)
		return
	}
	order, err := c.orders.Create(ctx, service.CreateOrderInput{
		TenantID:    *snap.TenantID,
		ClientID:    cli.ID,
		ServiceID:   svcUUID,
		AddressText: addr,
		ScheduledAt: scheduled,
	})
	if err != nil {
		if errors.Is(err, service.ErrServiceNotFound) {
			shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Услуга больше недоступна. Введите /book снова."})
			return
		}
		c.log.Error("create order", "err", err)
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Не удалось создать заказ, попробуйте позже."})
		return
	}
	if err := c.sessions.Reset(ctx, chatID); err != nil {
		c.log.Warn("reset session", "chat_id", chatID, "err", err)
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID,
		Text: fmt.Sprintf(
			"Заказ #%s создан! Ищем для вас мастера — мы пришлём уведомление, когда заказ подтвердится.",
			Short(order.ID.String()),
		),
	})
}

func (c *Bot) callbackRate(ctx context.Context, b *bot.Bot, u *models.Update) {
	cq := u.CallbackQuery
	if cq == nil {
		return
	}
	chatID := cq.Message.Message.Chat.ID
	shared.AnswerCB(ctx, c.log, b, cq.ID)

	parts := strings.Split(strings.TrimPrefix(cq.Data, "rate:"), ":")
	if len(parts) != 2 {
		return
	}
	orderID, err := uuid.Parse(parts[0])
	if err != nil {
		return
	}
	rating, err := strconv.Atoi(parts[1])
	if err != nil || rating < 1 || rating > 5 {
		return
	}
	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil || snap.TenantID == nil {
		return
	}
	cli, err := c.clients.GetByTelegram(ctx, *snap.TenantID, cq.From.ID)
	if err != nil {
		c.log.Error("get client", "err", err)
		return
	}
	if _, err := c.orders.SubmitReview(ctx, service.SubmitReviewInput{
		TenantID: *snap.TenantID,
		OrderID:  orderID,
		ClientID: cli.ID,
		Rating:   rating,
	}); err != nil {
		c.log.Warn("submit review", "order_id", orderID, "err", err)
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Не удалось сохранить оценку."})
		return
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{
		ChatID: chatID,
		Text:   fmt.Sprintf("Спасибо за оценку %s/5! Мы передадим её мастеру.", strings.Repeat("⭐", rating)),
	})
}

func (c *Bot) ordersHandler(ctx context.Context, b *bot.Bot, u *models.Update) {
	chatID := u.Message.Chat.ID
	snap, err := c.sessions.Load(ctx, chatID)
	if err != nil || snap.TenantID == nil {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Сначала откройте бота по ссылке от компании."})
		return
	}
	cli, err := c.clients.GetByTelegram(ctx, *snap.TenantID, u.Message.From.ID)
	if err != nil {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Заказов пока нет."})
		return
	}
	orders, err := c.ordersR.ListByClient(ctx, cli.ID, 5)
	if err != nil {
		c.log.Error("list orders", "client_id", cli.ID, "err", err)
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Не удалось загрузить заказы."})
		return
	}
	if len(orders) == 0 {
		shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: "Заказов пока нет."})
		return
	}
	var sb strings.Builder
	sb.WriteString("Ваши последние заказы:\n\n")
	for _, o := range orders {
		sb.WriteString(fmt.Sprintf("• #%s — %s — %s — %.0f ₽\n",
			Short(o.ID.String()), o.ScheduledAt.Format("02.01 15:04"), o.Status, o.Price))
	}
	shared.Send(ctx, c.log, b, &bot.SendMessageParams{ChatID: chatID, Text: sb.String()})
}

func parseScheduled(dateStr, hourStr, tz string) (time.Time, error) {
	d, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Time{}, err
	}
	h, err := strconv.Atoi(hourStr)
	if err != nil {
		return time.Time{}, err
	}
	loc := time.UTC
	if tz != "" {
		if l, err := time.LoadLocation(tz); err == nil {
			loc = l
		}
	}
	return time.Date(d.Year(), d.Month(), d.Day(), h, 0, 0, 0, loc), nil
}

func Short(id string) string {
	if len(id) > 8 {
		return id[:8]
	}
	return id
}

func sanitizePhone(s string) string {
	var buf []byte
	for _, c := range []byte(s) {
		if (c >= '0' && c <= '9') || c == '+' || c == '-' || c == ' ' {
			buf = append(buf, c)
		}
	}
	return string(buf)
}
