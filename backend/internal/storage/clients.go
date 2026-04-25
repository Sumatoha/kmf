package storage

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type ClientRepo struct{ pool *pgxpool.Pool }

func NewClientRepo(pool *pgxpool.Pool) *ClientRepo { return &ClientRepo{pool: pool} }

const clientCols = "id, tenant_id, telegram_id, telegram_username, full_name, phone, created_at, updated_at"

func scanClient(row interface {
	Scan(...any) error
}) (*model.Client, error) {
	var c model.Client
	if err := row.Scan(&c.ID, &c.TenantID, &c.TelegramID, &c.TelegramUsername, &c.FullName, &c.Phone, &c.CreatedAt, &c.UpdatedAt); err != nil {
		return nil, wrapNotFound(err)
	}
	return &c, nil
}

func (r *ClientRepo) UpsertByTelegram(ctx context.Context, tenantID uuid.UUID, tgID int64, tgUsername, fullName *string) (*model.Client, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO clients (tenant_id, telegram_id, telegram_username, full_name)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (tenant_id, telegram_id) WHERE telegram_id IS NOT NULL DO UPDATE
		SET telegram_username = EXCLUDED.telegram_username,
		    full_name = COALESCE(EXCLUDED.full_name, clients.full_name)
		RETURNING `+clientCols, tenantID, tgID, tgUsername, fullName)
	return scanClient(row)
}

func (r *ClientRepo) GetByTelegram(ctx context.Context, tenantID uuid.UUID, tgID int64) (*model.Client, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+clientCols+` FROM clients WHERE tenant_id = $1 AND telegram_id = $2`, tenantID, tgID)
	return scanClient(row)
}

func (r *ClientRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Client, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+clientCols+` FROM clients WHERE id = $1`, id)
	return scanClient(row)
}

func (r *ClientRepo) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]*model.Client, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT `+clientCols+` FROM clients WHERE tenant_id = $1 ORDER BY created_at DESC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Client
	for rows.Next() {
		c, err := scanClient(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (r *ClientRepo) UpdateContact(ctx context.Context, id uuid.UUID, fullName, phone *string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE clients
		SET full_name = COALESCE($2, full_name),
		    phone = COALESCE($3, phone)
		WHERE id = $1`, id, fullName, phone)
	return err
}
