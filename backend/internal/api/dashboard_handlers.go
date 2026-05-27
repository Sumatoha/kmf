package api

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type dashboardStats struct {
	OrdersNew        int     `json:"orders_new"`
	OrdersInProgress int     `json:"orders_in_progress"`
	OrdersDoneToday  int     `json:"orders_done_today"`
	RevenueToday     float64 `json:"revenue_today"`
	ActiveMasters    int     `json:"active_masters"`
	TotalClients     int     `json:"total_clients"`
}

func queryDashboardStats(pool *pgxpool.Pool) func(r *http.Request, tenantID uuid.UUID) (*dashboardStats, error) {
	return func(r *http.Request, tenantID uuid.UUID) (*dashboardStats, error) {
		var s dashboardStats
		err := pool.QueryRow(r.Context(), `
			SELECT
				COUNT(*) FILTER (WHERE status = 'new'),
				COUNT(*) FILTER (WHERE status = 'in_progress'),
				COUNT(*) FILTER (WHERE status = 'done' AND completed_at::date = CURRENT_DATE),
				COALESCE(SUM(price) FILTER (WHERE status = 'done' AND completed_at::date = CURRENT_DATE), 0)
			FROM orders
			WHERE tenant_id = $1`, tenantID,
		).Scan(&s.OrdersNew, &s.OrdersInProgress, &s.OrdersDoneToday, &s.RevenueToday)
		return &s, err
	}
}

func dashboardStatsHandler(d Deps) http.HandlerFunc {
	query := queryDashboardStats(d.Pool)
	return func(w http.ResponseWriter, r *http.Request) {
		tenantID := tenantIDFrom(r.Context())

		stats, err := query(r, tenantID)
		if err != nil {
			d.Log.Error("dashboard stats: orders", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}

		var activeMasters, totalClients int
		if err := d.Pool.QueryRow(r.Context(),
			`SELECT COUNT(*) FILTER (WHERE is_active), COUNT(*) FROM masters WHERE tenant_id = $1`,
			tenantID).Scan(&activeMasters, &totalClients); err != nil {
			d.Log.Error("dashboard stats: masters", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		stats.ActiveMasters = activeMasters

		if err := d.Pool.QueryRow(r.Context(),
			`SELECT COUNT(*) FROM clients WHERE tenant_id = $1`, tenantID,
		).Scan(&stats.TotalClients); err != nil {
			d.Log.Error("dashboard stats: clients", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}

		writeJSON(w, http.StatusOK, stats)
	}
}
