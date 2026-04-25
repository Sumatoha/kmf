package storage

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type TenantRepo struct{ pool *pgxpool.Pool }

func NewTenantRepo(pool *pgxpool.Pool) *TenantRepo { return &TenantRepo{pool: pool} }

const tenantCols = "id, slug, name, timezone, currency, is_active, created_at, updated_at"

func scanTenant(row interface {
	Scan(...any) error
}) (*model.Tenant, error) {
	var t model.Tenant
	if err := row.Scan(&t.ID, &t.Slug, &t.Name, &t.Timezone, &t.Currency, &t.IsActive, &t.CreatedAt, &t.UpdatedAt); err != nil {
		return nil, wrapNotFound(err)
	}
	return &t, nil
}

func (r *TenantRepo) Create(ctx context.Context, slug, name string) (*model.Tenant, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO tenants (slug, name)
		VALUES ($1, $2)
		RETURNING `+tenantCols, slug, name)
	return scanTenant(row)
}

func (r *TenantRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Tenant, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+tenantCols+` FROM tenants WHERE id = $1`, id)
	return scanTenant(row)
}

func (r *TenantRepo) GetBySlug(ctx context.Context, slug string) (*model.Tenant, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+tenantCols+` FROM tenants WHERE slug = $1`, slug)
	return scanTenant(row)
}

func (r *TenantRepo) List(ctx context.Context) ([]*model.Tenant, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+tenantCols+` FROM tenants ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Tenant
	for rows.Next() {
		t, err := scanTenant(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}
