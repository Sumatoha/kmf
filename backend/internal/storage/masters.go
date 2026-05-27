package storage

import (
	"context"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type MasterRepo struct{ pool DB }

func NewMasterRepo(pool DB) *MasterRepo { return &MasterRepo{pool: pool} }

const masterCols = `id, tenant_id, telegram_id, telegram_username, full_name, phone, rating,
	completed_orders, is_active, is_available, invite_token, invited_at, activated_at,
	created_at, updated_at`

func scanMaster(row interface {
	Scan(...any) error
}) (*model.Master, error) {
	var m model.Master
	if err := row.Scan(
		&m.ID, &m.TenantID, &m.TelegramID, &m.TelegramUsername, &m.FullName, &m.Phone,
		&m.Rating, &m.CompletedOrders, &m.IsActive, &m.IsAvailable, &m.InviteToken,
		&m.InvitedAt, &m.ActivatedAt, &m.CreatedAt, &m.UpdatedAt,
	); err != nil {
		return nil, wrapNotFound(err)
	}
	return &m, nil
}

func (r *MasterRepo) Create(ctx context.Context, tenantID uuid.UUID, fullName string, phone *string, inviteToken string) (*model.Master, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO masters (tenant_id, full_name, phone, invite_token, invited_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING `+masterCols, tenantID, fullName, phone, inviteToken)
	return scanMaster(row)
}

func (r *MasterRepo) GetByID(ctx context.Context, tenantID, id uuid.UUID) (*model.Master, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+masterCols+` FROM masters WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	return scanMaster(row)
}

func (r *MasterRepo) GetByIDGlobal(ctx context.Context, id uuid.UUID) (*model.Master, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+masterCols+` FROM masters WHERE id = $1`, id)
	return scanMaster(row)
}

func (r *MasterRepo) GetByInviteToken(ctx context.Context, token string) (*model.Master, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+masterCols+` FROM masters WHERE invite_token = $1`, token)
	return scanMaster(row)
}

func (r *MasterRepo) GetByTelegramID(ctx context.Context, tgID int64) (*model.Master, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+masterCols+` FROM masters WHERE telegram_id = $1 LIMIT 1`, tgID)
	return scanMaster(row)
}

func (r *MasterRepo) ActivateByInvite(ctx context.Context, token string, tgID int64, tgUsername *string) (*model.Master, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE masters
		SET telegram_id = $2,
		    telegram_username = $3,
		    activated_at = NOW(),
		    invite_token = NULL
		WHERE invite_token = $1
		RETURNING `+masterCols, token, tgID, tgUsername)
	return scanMaster(row)
}

func (r *MasterRepo) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]*model.Master, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT `+masterCols+` FROM masters WHERE tenant_id = $1 ORDER BY full_name ASC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Master
	for rows.Next() {
		m, err := scanMaster(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

func (r *MasterRepo) ListAvailable(ctx context.Context, tenantID uuid.UUID) ([]*model.Master, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+masterCols+` FROM masters
		WHERE tenant_id = $1 AND is_active = TRUE AND is_available = TRUE AND telegram_id IS NOT NULL
		ORDER BY rating DESC, completed_orders DESC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Master
	for rows.Next() {
		m, err := scanMaster(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

func (r *MasterRepo) SetAvailability(ctx context.Context, tenantID, id uuid.UUID, available bool) error {
	_, err := r.pool.Exec(ctx, `UPDATE masters SET is_available = $2 WHERE id = $1 AND tenant_id = $3`, id, available, tenantID)
	return err
}

func (r *MasterRepo) IncrementCompletedAndUpdateRating(ctx context.Context, masterID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE masters m
		SET completed_orders = completed_orders + 1,
		    rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE master_id = m.id), m.rating)
		WHERE m.id = $1`, masterID)
	return err
}

func (r *MasterRepo) UpdateRating(ctx context.Context, masterID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE masters m
		SET rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE master_id = m.id), m.rating)
		WHERE m.id = $1`, masterID)
	return err
}
