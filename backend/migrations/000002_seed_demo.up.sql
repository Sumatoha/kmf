-- Demo tenant + a few services.
-- Create the admin user via the CLI:
--   go run ./cmd/admin -email=admin@demo.local -password=admin123 \
--                       -name="Demo Admin" -tenant-slug=demo

INSERT INTO tenants (id, slug, name, timezone, currency)
VALUES ('11111111-1111-1111-1111-111111111111', 'demo', 'Demo Cleaning Co', 'Europe/Moscow', 'RUB')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (tenant_id, name, description, base_price, duration_minutes, sort_order) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Standard cleaning',     'Regular apartment cleaning',           3500, 120, 1),
    ('11111111-1111-1111-1111-111111111111', 'Deep cleaning',         'Thorough deep clean of every surface', 7500, 300, 2),
    ('11111111-1111-1111-1111-111111111111', 'After-renovation',      'Post-construction cleanup',           12000, 480, 3),
    ('11111111-1111-1111-1111-111111111111', 'Window washing',        'Inside + outside windows',             2500,  90, 4)
ON CONFLICT DO NOTHING;
