package storage

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type UserRepo struct{ pool *pgxpool.Pool }

func NewUserRepo(pool *pgxpool.Pool) *UserRepo { return &UserRepo{pool: pool} }

const userCols = "id, tenant_id, email, password_hash, full_name, role, is_active, created_at, updated_at"

func scanUser(row interface {
	Scan(...any) error
}) (*model.User, error) {
	var u model.User
	if err := row.Scan(&u.ID, &u.TenantID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &u.IsActive, &u.CreatedAt, &u.UpdatedAt); err != nil {
		return nil, wrapNotFound(err)
	}
	return &u, nil
}

func (r *UserRepo) Create(ctx context.Context, tenantID uuid.UUID, email, passwordHash, fullName string, role model.UserRole) (*model.User, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO users (tenant_id, email, password_hash, full_name, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+userCols, tenantID, email, passwordHash, fullName, role)
	return scanUser(row)
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+userCols+` FROM users WHERE email = $1`, email)
	return scanUser(row)
}

func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+userCols+` FROM users WHERE id = $1`, id)
	return scanUser(row)
}
