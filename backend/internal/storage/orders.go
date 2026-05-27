package storage

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type OrderRepo struct{ pool DB }

func NewOrderRepo(pool DB) *OrderRepo { return &OrderRepo{pool: pool} }

const orderCols = `id, tenant_id, client_id, service_id, master_id, address_text, scheduled_at,
	status, price, notes, cancellation_reason,
	assigned_at, confirmed_at, started_at, completed_at, cancelled_at, reminded_at,
	created_at, updated_at`

func scanOrder(row interface {
	Scan(...any) error
}) (*model.Order, error) {
	var o model.Order
	if err := row.Scan(
		&o.ID, &o.TenantID, &o.ClientID, &o.ServiceID, &o.MasterID, &o.AddressText, &o.ScheduledAt,
		&o.Status, &o.Price, &o.Notes, &o.CancellationReason,
		&o.AssignedAt, &o.ConfirmedAt, &o.StartedAt, &o.CompletedAt, &o.CancelledAt, &o.RemindedAt,
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

func (r *OrderRepo) GetByID(ctx context.Context, tenantID, id uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+orderCols+` FROM orders WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	return scanOrder(row)
}

func (r *OrderRepo) GetByIDGlobal(ctx context.Context, id uuid.UUID) (*model.Order, error) {
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
	if limit <= 0 || limit > 200 {
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

func (r *OrderRepo) Assign(ctx context.Context, tenantID, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET master_id = $3, status = 'assigned', assigned_at = NOW()
		WHERE id = $1 AND tenant_id = $2 AND status = 'new'
		RETURNING `+orderCols, orderID, tenantID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) AssignByAdmin(ctx context.Context, tenantID, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET master_id = $3, status = 'assigned', assigned_at = NOW(),
		    confirmed_at = NULL, started_at = NULL
		WHERE id = $1 AND tenant_id = $2 AND status NOT IN ('done','cancelled')
		RETURNING `+orderCols, orderID, tenantID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Confirm(ctx context.Context, tenantID, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'confirmed', confirmed_at = NOW()
		WHERE id = $1 AND tenant_id = $2 AND master_id = $3 AND status = 'assigned'
		RETURNING `+orderCols, orderID, tenantID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Decline(ctx context.Context, tenantID, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET master_id = NULL, status = 'new', assigned_at = NULL
		WHERE id = $1 AND tenant_id = $2 AND master_id = $3 AND status = 'assigned'
		RETURNING `+orderCols, orderID, tenantID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Start(ctx context.Context, tenantID, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'in_progress',
		    started_at = NOW(),
		    confirmed_at = COALESCE(confirmed_at, NOW())
		WHERE id = $1 AND tenant_id = $2 AND master_id = $3 AND status IN ('assigned','confirmed')
		RETURNING `+orderCols, orderID, tenantID, masterID)
	return scanOrder(row)
}

func (r *OrderRepo) Complete(ctx context.Context, tenantID, orderID, masterID uuid.UUID) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'done', completed_at = NOW()
		WHERE id = $1 AND tenant_id = $2 AND master_id = $3 AND status = 'in_progress'
		RETURNING `+orderCols, orderID, tenantID, masterID)
	return scanOrder(row)
}

// ListNeedingReminder returns orders scheduled within the next `lead` window
// that haven't been reminded yet and are in a state where a reminder makes
// sense (assigned/confirmed). Used by the reminder scheduler.
func (r *OrderRepo) ListNeedingReminder(ctx context.Context, lead time.Duration) ([]*model.Order, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+orderCols+` FROM orders
		WHERE reminded_at IS NULL
		  AND status IN ('assigned','confirmed')
		  AND scheduled_at BETWEEN NOW() AND NOW() + (INTERVAL '1 second' * $1)
		ORDER BY scheduled_at ASC
		LIMIT 200`, int64(lead.Seconds()))
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

func (r *OrderRepo) MarkReminded(ctx context.Context, tenantID, orderID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `UPDATE orders SET reminded_at = NOW() WHERE id = $1 AND tenant_id = $2`, orderID, tenantID)
	return err
}

// ListForExport returns all orders for a tenant in a date range, newest first.
func (r *OrderRepo) ListForExport(ctx context.Context, tenantID uuid.UUID, from, to time.Time) ([]*model.Order, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+orderCols+` FROM orders
		WHERE tenant_id = $1 AND scheduled_at BETWEEN $2 AND $3
		ORDER BY scheduled_at DESC
		LIMIT 50000`, tenantID, from, to)
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

func (r *OrderRepo) Cancel(ctx context.Context, tenantID, orderID uuid.UUID, reason string) (*model.Order, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE orders
		SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $3
		WHERE id = $1 AND tenant_id = $2 AND status NOT IN ('done','cancelled')
		RETURNING `+orderCols, orderID, tenantID, reason)
	return scanOrder(row)
}
