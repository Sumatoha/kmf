package storage

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type OrderRepo struct{ pool *pgxpool.Pool }

func NewOrderRepo(pool *pgxpool.Pool) *OrderRepo { return &OrderRepo{pool: pool} }

const orderCols = `id, tenant_id, client_id, service_id, master_id, address_text, scheduled_at,
	status, price, notes, cancellation_reason,
	assigned_at, confirmed_at, started_at, completed_at, cancelled_at,
	created_at, updated_at`

func scanOrder(row interface {
	Scan(...any) error
}) (*model.Order, error) {
	var o model.Order
	if err := row.Scan(
		&o.ID, &o.TenantID, &o.ClientID, &o.ServiceID, &o.MasterID, &o.AddressText, &o.ScheduledAt,
		&o.Status, &o.Price, &o.Notes, &o.CancellationReason,
		&o.AssignedAt, &o.ConfirmedAt, &o.StartedAt, &o.CompletedAt, &o.CancelledAt,
		&o.CreatedAt, &o.UpdatedAt,
	); err != nil {
		return nil, wrapNotFound(err)
	}
	return &o, nil
}

type CreateOrderParams struct {
	TenantID    uuid.UUID
	ClientID    uuid.UUID
	ServiceID   uuid.UUID
	AddressText string
	ScheduledAt time.Time
	Price       float64
	Notes       *string
}

func (r *OrderRepo) Create(ctx context.Context, p CreateOrderParams) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		INSERT INTO orders (tenant_id, client_id, service_id, address_text, scheduled_at, price, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+orderCols,
		p.TenantID, p.ClientID, p.ServiceID, p.AddressText, p.ScheduledAt, p.Price, p.Notes)
	return scanOrder(row)
}

func (r *OrderRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+orderCols+` FROM orders WHERE id = $1`, id)
	return scanOrder(row)
}

func (r *OrderRepo) ListByTenant(ctx context.Context, tenantID uuid.UUID, status *model.OrderStatus, limit int) ([]*model.Order, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	var (
		rows pgx.Rows
		err  error
	)
	if status != nil {
		rows, err = r.pool.Query(ctx,
			`SELECT `+orderCols+` FROM orders WHERE tenant_id = $1 AND status = $2 ORDER BY scheduled_at DESC LIMIT $3`,
			tenantID, *status, limit)
	} else {
		rows, err = r.pool.Query(ctx,
			`SELECT `+orderCols+` FROM orders WHERE tenant_id = $1 ORDER BY scheduled_at DESC LIMIT $2`,
			tenantID, limit)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Order
	for rows.Next() {
		o, err := scanOrder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

func (r *OrderRepo) ListByClient(ctx context.Context, clientID uuid.UUID, limit int) ([]*model.Order, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := r.pool.Query(ctx,
		`SELECT `+orderCols+` FROM orders WHERE client_id = $1 ORDER BY scheduled_at DESC LIMIT $2`,
		clientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Order
	for rows.Next() {
		o, err := scanOrder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

func (r *OrderRepo) ListActiveForMaster(ctx context.Context, masterID uuid.UUID) ([]*model.Order, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+orderCols+` FROM orders
		WHERE master_id = $1 AND status IN ('assigned','confirmed','in_progress')
		ORDER BY scheduled_at ASC`, masterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Order
	for rows.Next() {
		o, err := scanOrder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

func (r *OrderRepo) Assign(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET master_id = $2, status = 'assigned', assigned_at = NOW()
		WHERE id = $1 AND status = 'new'
		RETURNING `+orderCols, orderID, masterID)
	return scanOrder(row)
}

// AssignByAdmin allows reassigning a master at any non-terminal stage. Used by
// the CRM when a dispatcher manually picks the executor.
func (r *OrderRepo) AssignByAdmin(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET master_id = $2, status = 'assigned', assigned_at = NOW(),
		    confirmed_at = NULL, started_at = NULL
		WHERE id = $1 AND status NOT IN ('done','cancelled')
		RETURNING `+orderCols, orderID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Confirm(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'confirmed', confirmed_at = NOW()
		WHERE id = $1 AND master_id = $2 AND status = 'assigned'
		RETURNING `+orderCols, orderID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Decline(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET master_id = NULL, status = 'new', assigned_at = NULL
		WHERE id = $1 AND master_id = $2 AND status = 'assigned'
		RETURNING `+orderCols, orderID, masterID)
	return scanOrder(row)
}

// Start moves an order to in_progress. Accepts both 'assigned' (admin
// pre-assigned) and 'confirmed' (master accepted via broadcast) as starting
// points so admin-assigned orders don't require an extra Accept tap.
func (r *OrderRepo) Start(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'in_progress',
		    started_at = NOW(),
		    confirmed_at = COALESCE(confirmed_at, NOW())
		WHERE id = $1 AND master_id = $2 AND status IN ('assigned','confirmed')
		RETURNING `+orderCols, orderID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Complete(ctx context.Context, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'done', completed_at = NOW()
		WHERE id = $1 AND master_id = $2 AND status = 'in_progress'
		RETURNING `+orderCols, orderID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Cancel(ctx context.Context, orderID uuid.UUID, reason string) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $2
		WHERE id = $1 AND status NOT IN ('done','cancelled')
		RETURNING `+orderCols, orderID, reason)
	return scanOrder(row)
}
