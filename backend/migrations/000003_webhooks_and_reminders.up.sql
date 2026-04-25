-- Reminders & webhooks
-- Adds:
--   * orders.reminded_at — set when the 1h-before reminder is sent
--   * webhooks         — per-tenant webhook subscriptions
--   * webhook_deliveries — outbound delivery queue with retry metadata

ALTER TABLE orders ADD COLUMN reminded_at TIMESTAMPTZ;

CREATE TABLE webhooks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    secret      TEXT NOT NULL,
    events      TEXT[] NOT NULL DEFAULT ARRAY['*']::TEXT[],
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_webhooks_tenant_id ON webhooks(tenant_id);

CREATE TYPE webhook_delivery_status AS ENUM ('pending', 'success', 'failed');

CREATE TABLE webhook_deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id      UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,
    payload         JSONB NOT NULL,
    status          webhook_delivery_status NOT NULL DEFAULT 'pending',
    attempts        INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_attempt_at TIMESTAMPTZ,
    response_code   INTEGER,
    error           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_webhook_deliveries_status_next
    ON webhook_deliveries(status, next_attempt_at)
    WHERE status = 'pending';

CREATE TRIGGER trg_webhooks_updated BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
