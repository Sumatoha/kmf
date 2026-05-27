-- Composite index for the most common orders query
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status_sched
    ON orders(tenant_id, status, scheduled_at DESC);

-- Partial covering index for the reminder scheduler
CREATE INDEX IF NOT EXISTS idx_orders_reminder
    ON orders(scheduled_at, tenant_id)
    WHERE reminded_at IS NULL
      AND status IN ('assigned', 'confirmed');

-- Partial unique index for phone-based client upsert
CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_tenant_phone
    ON clients(tenant_id, phone)
    WHERE phone IS NOT NULL;

-- Tenant-scoped webhook delivery history
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_tenant_created
    ON webhook_deliveries(tenant_id, created_at DESC);

-- Drop the global email unique, add per-tenant unique
-- (safe: we check no cross-tenant email collisions first)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_tenant_email ON users(tenant_id, email);
