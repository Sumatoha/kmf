-- ============================================================================
-- CleanOps initial schema
-- Multi-tenant: every business table carries tenant_id and is filtered on it.
-- When migrating to Supabase, RLS policies will be added in a later migration.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- enums ------------------------------------------------------------

CREATE TYPE user_role     AS ENUM ('owner', 'admin', 'dispatcher');
CREATE TYPE order_status  AS ENUM ('new', 'assigned', 'confirmed', 'in_progress', 'done', 'cancelled');
CREATE TYPE bot_kind      AS ENUM ('client', 'master');

-- ---------- tenants ----------------------------------------------------------

CREATE TABLE tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    timezone    TEXT NOT NULL DEFAULT 'Asia/Almaty',
    currency    TEXT NOT NULL DEFAULT 'KZT',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- users (CRM admins) -----------------------------------------------

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'admin',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- ---------- masters (cleaners) -----------------------------------------------

CREATE TABLE masters (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    telegram_id        BIGINT,
    telegram_username  TEXT,
    full_name          TEXT NOT NULL,
    phone              TEXT,
    rating             NUMERIC(3,2) NOT NULL DEFAULT 0,
    completed_orders   INTEGER NOT NULL DEFAULT 0,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    is_available       BOOLEAN NOT NULL DEFAULT TRUE,
    invite_token       TEXT UNIQUE,
    invited_at         TIMESTAMPTZ,
    activated_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_masters_tenant_id ON masters(tenant_id);
CREATE UNIQUE INDEX uq_masters_tenant_telegram ON masters(tenant_id, telegram_id) WHERE telegram_id IS NOT NULL;

-- ---------- clients ----------------------------------------------------------

CREATE TABLE clients (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    telegram_id        BIGINT,
    telegram_username  TEXT,
    full_name          TEXT,
    phone              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_clients_tenant_id ON clients(tenant_id);
CREATE UNIQUE INDEX uq_clients_tenant_telegram ON clients(tenant_id, telegram_id) WHERE telegram_id IS NOT NULL;

-- ---------- addresses --------------------------------------------------------

CREATE TABLE addresses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    label        TEXT,
    full_address TEXT NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_addresses_client_id ON addresses(client_id);

-- ---------- services ---------------------------------------------------------

CREATE TABLE services (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    description       TEXT,
    base_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
    duration_minutes  INTEGER NOT NULL DEFAULT 120,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_tenant_id ON services(tenant_id);

-- ---------- orders -----------------------------------------------------------

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    service_id          UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    master_id           UUID REFERENCES masters(id) ON DELETE SET NULL,
    address_text        TEXT NOT NULL,
    scheduled_at        TIMESTAMPTZ NOT NULL,
    status              order_status NOT NULL DEFAULT 'new',
    price               NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    cancellation_reason TEXT,
    assigned_at         TIMESTAMPTZ,
    confirmed_at        TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_orders_tenant_id     ON orders(tenant_id);
CREATE INDEX idx_orders_client_id     ON orders(client_id);
CREATE INDEX idx_orders_master_id     ON orders(master_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_scheduled_at  ON orders(scheduled_at);

-- ---------- reviews ----------------------------------------------------------

CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id    UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    master_id   UUID REFERENCES masters(id) ON DELETE SET NULL,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX idx_reviews_master_id ON reviews(master_id);

-- ---------- bot sessions (FSM state per chat) --------------------------------

CREATE TABLE bot_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind        bot_kind NOT NULL,
    chat_id     BIGINT NOT NULL,
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    state       TEXT NOT NULL DEFAULT 'idle',
    data        JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_bot_sessions_kind_chat ON bot_sessions(kind, chat_id);

-- ---------- updated_at triggers ---------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated   BEFORE UPDATE ON tenants    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated     BEFORE UPDATE ON users      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_masters_updated   BEFORE UPDATE ON masters    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_clients_updated   BEFORE UPDATE ON clients    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_services_updated  BEFORE UPDATE ON services   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated    BEFORE UPDATE ON orders     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
