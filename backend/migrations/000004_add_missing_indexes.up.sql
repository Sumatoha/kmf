-- Missing indexes identified during code audit

-- Efficient session GC: DeleteStale filters by updated_at
CREATE INDEX idx_bot_sessions_updated_at ON bot_sessions(updated_at);

-- Webhook delivery FK lookup
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);

-- Master sorting in ListAvailable: ORDER BY rating DESC, completed_orders DESC
CREATE INDEX idx_masters_available ON masters(tenant_id, is_available, is_active)
    WHERE is_available = TRUE AND is_active = TRUE AND telegram_id IS NOT NULL;
