// Package service - webhooks subsystem.
//
// We support fan-out of business events (order.created, order.confirmed,
// order.completed, order.cancelled, review.created) to per-tenant HTTP
// endpoints. Each delivery is queued to webhook_deliveries; a background
// dispatcher picks them up, signs them with HMAC-SHA256 and retries with
// exponential backoff.
package service

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

const (
	EventOrderCreated   = "order.created"
	EventOrderConfirmed = "order.confirmed"
	EventOrderStarted   = "order.started"
	EventOrderCompleted = "order.completed"
	EventOrderCancelled = "order.cancelled"
	EventReviewCreated  = "review.created"

	maxDeliveryAttempts = 8
)

type WebhookService struct {
	repo *storage.WebhookRepo
	log  *slog.Logger
}

func NewWebhookService(repo *storage.WebhookRepo, log *slog.Logger) *WebhookService {
	return &WebhookService{repo: repo, log: log}
}

type CreateWebhookInput struct {
	TenantID    uuid.UUID
	URL         string
	Events      []string
	Description *string
}

func (s *WebhookService) Create(ctx context.Context, in CreateWebhookInput) (*model.Webhook, string, error) {
	parsed, err := url.Parse(in.URL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return nil, "", errors.New("url must be http(s)")
	}
	if parsed.Hostname() == "" {
		return nil, "", errors.New("url must have a hostname")
	}
	if isPrivateHost(parsed.Hostname()) {
		return nil, "", errors.New("url must not point to a private address")
	}
	secret, err := generateSecret()
	if err != nil {
		return nil, "", err
	}
	hook, err := s.repo.Create(ctx, in.TenantID, in.URL, secret, in.Events, in.Description)
	if err != nil {
		return nil, "", err
	}
	return hook, secret, nil
}

func (s *WebhookService) List(ctx context.Context, tenantID uuid.UUID) ([]*model.Webhook, error) {
	return s.repo.ListByTenant(ctx, tenantID)
}

func (s *WebhookService) Delete(ctx context.Context, tenantID, id uuid.UUID) error {
	return s.repo.Delete(ctx, tenantID, id)
}

// Enqueue serialises an event payload and queues a delivery for every active
// subscription of the tenant that matches the event type. Returns the count
// of deliveries enqueued.
func (s *WebhookService) Enqueue(ctx context.Context, tenantID uuid.UUID, event string, payload any) int {
	subs, err := s.repo.ListActiveSubscribed(ctx, tenantID, event)
	if err != nil {
		s.log.Warn("webhook list subscribed", "tenant_id", tenantID, "event", event, "err", err)
		return 0
	}
	if len(subs) == 0 {
		return 0
	}
	body, err := json.Marshal(map[string]any{
		"event":     event,
		"tenant_id": tenantID,
		"data":      payload,
		"sent_at":   time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		s.log.Error("webhook marshal", "err", err)
		return 0
	}
	var n int
	for _, w := range subs {
		if _, err := s.repo.EnqueueDelivery(ctx, w.ID, tenantID, event, body); err != nil {
			s.log.Warn("webhook enqueue", "webhook_id", w.ID, "err", err)
			continue
		}
		n++
	}
	return n
}

// RunDispatcher polls for due deliveries and sends them. Cancel ctx to stop.
func (s *WebhookService) RunDispatcher(ctx context.Context, httpClient *http.Client) {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 10 * time.Second}
	}
	tick := time.NewTicker(10 * time.Second)
	defer tick.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
			s.dispatchBatch(ctx, httpClient)
		}
	}
}

func (s *WebhookService) dispatchBatch(ctx context.Context, client *http.Client) {
	deliveries, err := s.repo.ClaimPending(ctx, 32)
	if err != nil {
		s.log.Warn("webhook claim", "err", err)
		return
	}
	for _, d := range deliveries {
		s.deliver(ctx, client, d)
	}
}

func (s *WebhookService) deliver(ctx context.Context, client *http.Client, d *model.WebhookDelivery) {
	hook, err := s.repo.GetByID(ctx, d.TenantID, d.WebhookID)
	if err != nil {
		_ = s.repo.MarkRetry(ctx, d.ID, d.Attempts, nil, "lookup webhook: "+err.Error(), maxDeliveryAttempts)
		return
	}
	if !hook.IsActive {
		_ = s.repo.MarkRetry(ctx, d.ID, d.Attempts, nil, "webhook disabled", maxDeliveryAttempts)
		return
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, hook.URL, bytes.NewReader(d.Payload))
	if err != nil {
		_ = s.repo.MarkRetry(ctx, d.ID, d.Attempts, nil, "build request: "+err.Error(), maxDeliveryAttempts)
		return
	}
	sig := signPayload(hook.Secret, d.Payload)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-CleanOps-Event", d.EventType)
	req.Header.Set("X-CleanOps-Delivery", d.ID.String())
	req.Header.Set("X-CleanOps-Signature", "sha256="+sig)

	resp, err := client.Do(req)
	if err != nil {
		_ = s.repo.MarkRetry(ctx, d.ID, d.Attempts, nil, err.Error(), maxDeliveryAttempts)
		return
	}
	defer func() {
		_, _ = io.Copy(io.Discard, resp.Body)
		resp.Body.Close()
	}()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		if err := s.repo.MarkSuccess(ctx, d.ID, resp.StatusCode); err != nil {
			s.log.Warn("webhook mark success", "delivery_id", d.ID, "err", err)
		}
		return
	}
	code := resp.StatusCode
	_ = s.repo.MarkRetry(ctx, d.ID, d.Attempts, &code, "non-2xx status: "+strconv.Itoa(code), maxDeliveryAttempts)
}

func signPayload(secret string, body []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}

func generateSecret() (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func isPrivateHost(host string) bool {
	privates := []string{
		"localhost", "127.0.0.1", "::1", "0.0.0.0",
		"169.254.", "10.", "192.168.",
		"172.16.", "172.17.", "172.18.", "172.19.",
		"172.20.", "172.21.", "172.22.", "172.23.",
		"172.24.", "172.25.", "172.26.", "172.27.",
		"172.28.", "172.29.", "172.30.", "172.31.",
		"metadata.google.internal",
	}
	for _, p := range privates {
		if host == p || (len(p) > 1 && p[len(p)-1] == '.' && len(host) > len(p) && host[:len(p)] == p) {
			return true
		}
	}
	return false
}
