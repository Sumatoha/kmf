package storage

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type WebhookRepo struct{ pool *pgxpool.Pool }

func NewWebhookRepo(pool *pgxpool.Pool) *WebhookRepo { return &WebhookRepo{pool: pool} }

const webhookCols = "id, tenant_id, url, secret, events, description, is_active, created_at"

func scanWebhook(row interface {
	Scan(...any) error
}) (*model.Webhook, error) {
	var w model.Webhook
	if err := row.Scan(&w.ID, &w.TenantID, &w.URL, &w.Secret, &w.Events, &w.Description, &w.IsActive, &w.CreatedAt); err != nil {
		return nil, wrapNotFound(err)
	}
	return &w, nil
}

func (r *WebhookRepo) Create(ctx context.Context, tenantID uuid.UUID, url, secret string, events []string, desc *string) (*model.Webhook, error) {
	if len(events) == 0 {
		events = []string{"*"}
	}
	row := r.pool.QueryRow(ctx, `
		INSERT INTO webhooks (tenant_id, url, secret, events, description)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+webhookCols, tenantID, url, secret, events, desc)
	return scanWebhook(row)
}

func (r *WebhookRepo) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]*model.Webhook, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT `+webhookCols+` FROM webhooks WHERE tenant_id = $1 ORDER BY created_at DESC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Webhook
	for rows.Next() {
		w, err := scanWebhook(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, w)
	}
	return out, rows.Err()
}

func (r *WebhookRepo) ListActiveSubscribed(ctx context.Context, tenantID uuid.UUID, eventType string) ([]*model.Webhook, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+webhookCols+` FROM webhooks
		WHERE tenant_id = $1 AND is_active = TRUE
		  AND ('*' = ANY(events) OR $2 = ANY(events))`,
		tenantID, eventType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Webhook
	for rows.Next() {
		w, err := scanWebhook(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, w)
	}
	return out, rows.Err()
}

func (r *WebhookRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Webhook, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+webhookCols+` FROM webhooks WHERE id = $1`, id)
	return scanWebhook(row)
}

func (r *WebhookRepo) Delete(ctx context.Context, tenantID, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM webhooks WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	return err
}

// ---- deliveries -----------------------------------------------------------

const deliveryCols = `id, webhook_id, tenant_id, event_type, payload, status, attempts,
	next_attempt_at, last_attempt_at, response_code, error, created_at`

func scanDelivery(row interface {
	Scan(...any) error
}) (*model.WebhookDelivery, error) {
	var d model.WebhookDelivery
	if err := row.Scan(
		&d.ID, &d.WebhookID, &d.TenantID, &d.EventType, &d.Payload, &d.Status, &d.Attempts,
		&d.NextAttemptAt, &d.LastAttemptAt, &d.ResponseCode, &d.Error, &d.CreatedAt,
	); err != nil {
		return nil, wrapNotFound(err)
	}
	return &d, nil
}

func (r *WebhookRepo) EnqueueDelivery(ctx context.Context, webhookID, tenantID uuid.UUID, event string, payload []byte) (*model.WebhookDelivery, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO webhook_deliveries (webhook_id, tenant_id, event_type, payload)
		VALUES ($1, $2, $3, $4)
		RETURNING `+deliveryCols, webhookID, tenantID, event, payload)
	return scanDelivery(row)
}

// ClaimPending atomically picks up to `batch` deliveries that are due and
// returns them. Each row's next_attempt_at is pushed forward to avoid double
// dispatch if claim and update overlap.
func (r *WebhookRepo) ClaimPending(ctx context.Context, batch int) ([]*model.WebhookDelivery, error) {
	rows, err := r.pool.Query(ctx, `
		WITH due AS (
		    SELECT id FROM webhook_deliveries
		    WHERE status = 'pending' AND next_attempt_at <= NOW()
		    ORDER BY next_attempt_at ASC
		    LIMIT $1
		    FOR UPDATE SKIP LOCKED
		)
		UPDATE webhook_deliveries d
		SET next_attempt_at = NOW() + INTERVAL '5 minutes'
		FROM due
		WHERE d.id = due.id
		RETURNING `+deliveryCols, batch)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.WebhookDelivery
	for rows.Next() {
		d, err := scanDelivery(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

func (r *WebhookRepo) MarkSuccess(ctx context.Context, id uuid.UUID, code int) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE webhook_deliveries
		SET status = 'success', attempts = attempts + 1,
		    last_attempt_at = NOW(), response_code = $2, error = NULL
		WHERE id = $1`, id, code)
	return err
}

// MarkRetry pushes the delivery back into the queue with exponential backoff
// based on the prior attempt count. After maxAttempts it transitions to 'failed'.
func (r *WebhookRepo) MarkRetry(ctx context.Context, id uuid.UUID, attemptsSoFar int, code *int, errMsg string, maxAttempts int) error {
	next := backoffSeconds(attemptsSoFar)
	_, err := r.pool.Exec(ctx, `
		UPDATE webhook_deliveries
		SET attempts = attempts + 1,
		    last_attempt_at = NOW(),
		    response_code = $2,
		    error = $3,
		    status = CASE WHEN attempts + 1 >= $5 THEN 'failed'::webhook_delivery_status ELSE 'pending'::webhook_delivery_status END,
		    next_attempt_at = NOW() + (INTERVAL '1 second' * $4)
		WHERE id = $1`, id, code, errMsg, next, maxAttempts)
	return err
}

// backoffSeconds returns 30, 120, 600, 1800, 3600… capped at 1h.
func backoffSeconds(attempts int) int64 {
	base := int64(30)
	for i := 0; i < attempts; i++ {
		base *= 4
		if base >= 3600 {
			return 3600
		}
	}
	return base
}
