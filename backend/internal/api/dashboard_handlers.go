package api

import (
	"net/http"
	"time"

	"github.com/sumatoha/kmf/backend/internal/model"
)

type dashboardStats struct {
	OrdersNew        int     `json:"orders_new"`
	OrdersInProgress int     `json:"orders_in_progress"`
	OrdersDoneToday  int     `json:"orders_done_today"`
	RevenueToday     float64 `json:"revenue_today"`
	ActiveMasters    int     `json:"active_masters"`
	TotalClients     int     `json:"total_clients"`
}

func dashboardStatsHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		tenantID := tenantIDFrom(ctx)

		newSt := model.OrderStatusNew
		newOrders, err := d.OrdersR.ListByTenant(ctx, tenantID, &newSt, 500)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		inProgSt := model.OrderStatusInProgress
		inProg, err := d.OrdersR.ListByTenant(ctx, tenantID, &inProgSt, 500)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		doneSt := model.OrderStatusDone
		done, err := d.OrdersR.ListByTenant(ctx, tenantID, &doneSt, 500)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		var doneToday int
		var revenue float64
		now := time.Now()
		nowY, nowM, nowD := now.Date()
		for _, o := range done {
			if o.CompletedAt == nil {
				continue
			}
			y, m, day := o.CompletedAt.Date()
			if y == nowY && m == nowM && day == nowD {
				doneToday++
				revenue += o.Price
			}
		}

		masters, err := d.Masters.ListByTenant(ctx, tenantID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		var active int
		for _, m := range masters {
			if m.IsActive {
				active++
			}
		}

		clients, err := d.Clients.ListByTenant(ctx, tenantID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		writeJSON(w, http.StatusOK, dashboardStats{
			OrdersNew:        len(newOrders),
			OrdersInProgress: len(inProg),
			OrdersDoneToday:  doneToday,
			RevenueToday:     revenue,
			ActiveMasters:    active,
			TotalClients:     len(clients),
		})
	}
}
