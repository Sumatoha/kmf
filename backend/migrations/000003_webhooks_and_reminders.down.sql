DROP TRIGGER IF EXISTS trg_webhooks_updated ON webhooks;
DROP TABLE IF EXISTS webhook_deliveries;
DROP TYPE  IF EXISTS webhook_delivery_status;
DROP TABLE IF EXISTS webhooks;
ALTER TABLE orders DROP COLUMN IF EXISTS reminded_at;
