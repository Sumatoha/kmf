package storage

import (
	"context"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type ReviewRepo struct{ pool DB }

func NewReviewRepo(pool DB) *ReviewRepo { return &ReviewRepo{pool: pool} }

const reviewCols = "id, tenant_id, order_id, client_id, master_id, rating, comment, created_at"

func scanReview(row interface {
	Scan(...any) error
}) (*model.Review, error) {
	var rv model.Review
	if err := row.Scan(&rv.ID, &rv.TenantID, &rv.OrderID, &rv.ClientID, &rv.MasterID, &rv.Rating, &rv.Comment, &rv.CreatedAt); err != nil {
		return nil, wrapNotFound(err)
	}
	return &rv, nil
}

func (r *ReviewRepo) Create(ctx context.Context, tenantID, orderID, clientID uuid.UUID, masterID *uuid.UUID, rating int, comment *string) (*model.Review, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO reviews (tenant_id, order_id, client_id, master_id, rating, comment)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING `+reviewCols, tenantID, orderID, clientID, masterID, rating, comment)
	return scanReview(row)
}

func (r *ReviewRepo) GetByOrder(ctx context.Context, orderID uuid.UUID) (*model.Review, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+reviewCols+` FROM reviews WHERE order_id = $1`, orderID)
	return scanReview(row)
}
