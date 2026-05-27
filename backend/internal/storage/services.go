package storage

import (
	"context"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type ServiceRepo struct{ pool DB }

func NewServiceRepo(pool DB) *ServiceRepo { return &ServiceRepo{pool: pool} }

const serviceCols = "id, tenant_id, name, description, base_price, duration_minutes, is_active, sort_order, created_at, updated_at"

func scanService(row interface {
	Scan(...any) error
}) (*model.Service, error) {
	var s model.Service
	if err := row.Scan(&s.ID, &s.TenantID, &s.Name, &s.Description, &s.BasePrice, &s.DurationMinutes, &s.IsActive, &s.SortOrder, &s.CreatedAt, &s.UpdatedAt); err != nil {
		return nil, wrapNotFound(err)
	}
	return &s, nil
}

func (r *ServiceRepo) Create(ctx context.Context, tenantID uuid.UUID, name string, description *string, price float64, duration int) (*model.Service, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO services (tenant_id, name, description, base_price, duration_minutes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+serviceCols, tenantID, name, description, price, duration)
	return scanService(row)
}

func (r *ServiceRepo) GetByID(ctx context.Context, tenantID, id uuid.UUID) (*model.Service, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+serviceCols+` FROM services WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	return scanService(row)
}

func (r *ServiceRepo) ListActive(ctx context.Context, tenantID uuid.UUID) ([]*model.Service, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+serviceCols+` FROM services
		WHERE tenant_id = $1 AND is_active = TRUE
		ORDER BY sort_order ASC, name ASC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Service
	for rows.Next() {
		s, err := scanService(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (r *ServiceRepo) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]*model.Service, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT `+serviceCols+` FROM services WHERE tenant_id = $1 ORDER BY sort_order ASC, name ASC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Service
	for rows.Next() {
		s, err := scanService(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (r *ServiceRepo) Update(ctx context.Context, tenantID, id uuid.UUID, name string, description *string, price float64, duration int, isActive bool) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE services
		SET name = $2, description = $3, base_price = $4, duration_minutes = $5, is_active = $6
		WHERE id = $1 AND tenant_id = $7`, id, name, description, price, duration, isActive, tenantID)
	return err
}
