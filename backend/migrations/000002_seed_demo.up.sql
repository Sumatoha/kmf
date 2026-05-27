-- Demo tenant + a few services.
-- Создание admin-пользователя через CLI:
--   go run ./cmd/admin -email=admin@demo.kz -password=changeme123 \
--                        -name="Demo Admin" -tenant-slug=demo

INSERT INTO tenants (id, slug, name, timezone, currency)
VALUES ('11111111-1111-1111-1111-111111111111', 'demo', 'Demo Cleaning Co', 'Asia/Almaty', 'KZT')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (tenant_id, name, description, base_price, duration_minutes, sort_order) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Стандартная уборка',  'Поддерживающая уборка квартиры',          12000, 120, 1),
    ('11111111-1111-1111-1111-111111111111', 'Генеральная уборка',  'Глубокая уборка всех поверхностей',       24000, 300, 2),
    ('11111111-1111-1111-1111-111111111111', 'После ремонта',       'Уборка после строительных работ',         45000, 480, 3),
    ('11111111-1111-1111-1111-111111111111', 'Мытьё окон',          'Окна с двух сторон',                       9000,  90, 4)
ON CONFLICT DO NOTHING;
