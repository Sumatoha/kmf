DROP INDEX IF EXISTS idx_orders_tenant_status_sched;
DROP INDEX IF EXISTS idx_orders_reminder;
DROP INDEX IF EXISTS uq_clients_tenant_phone;
DROP INDEX IF EXISTS idx_webhook_deliveries_tenant_created;
DROP INDEX IF EXISTS uq_users_tenant_email;
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
