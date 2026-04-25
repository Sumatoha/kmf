DROP TRIGGER IF EXISTS trg_orders_updated   ON orders;
DROP TRIGGER IF EXISTS trg_services_updated ON services;
DROP TRIGGER IF EXISTS trg_clients_updated  ON clients;
DROP TRIGGER IF EXISTS trg_masters_updated  ON masters;
DROP TRIGGER IF EXISTS trg_users_updated    ON users;
DROP TRIGGER IF EXISTS trg_tenants_updated  ON tenants;
DROP FUNCTION IF EXISTS set_updated_at();

DROP TABLE IF EXISTS bot_sessions;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS masters;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;

DROP TYPE IF EXISTS bot_kind;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS user_role;
