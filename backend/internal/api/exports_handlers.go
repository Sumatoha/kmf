package api

import (
	"encoding/csv"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"
)

// exportOrdersCSV returns a CSV of orders in the requested time window
// (defaults to last 90 days). Streams the response so big datasets are fine.
func exportOrdersCSV(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		from, to := parseRange(r)
		orders, err := d.OrdersR.ListForExport(r.Context(), tenantIDFrom(r.Context()), from, to)
		if err != nil {
			d.Log.Error("export", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}

		filename := fmt.Sprintf("orders_%s_%s.csv", from.Format("20060102"), to.Format("20060102"))
		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)

		cw := csv.NewWriter(w)
		if err := cw.Write([]string{
			"id", "status", "client_id", "service_id", "master_id",
			"scheduled_at", "address", "price", "notes",
			"created_at", "completed_at",
		}); err != nil {
			slog.Default().Error("csv header write", "err", err)
			return
		}
		for _, o := range orders {
			masterID := ""
			if o.MasterID != nil {
				masterID = o.MasterID.String()
			}
			notes := ""
			if o.Notes != nil {
				notes = *o.Notes
			}
			completed := ""
			if o.CompletedAt != nil {
				completed = o.CompletedAt.Format(time.RFC3339)
			}
			if err := cw.Write([]string{
				o.ID.String(),
				string(o.Status),
				o.ClientID.String(),
				o.ServiceID.String(),
				masterID,
				o.ScheduledAt.Format(time.RFC3339),
				o.AddressText,
				strconv.FormatFloat(o.Price, 'f', 2, 64),
				notes,
				o.CreatedAt.Format(time.RFC3339),
				completed,
			}); err != nil {
				slog.Default().Error("csv row write", "err", err)
				return
			}
		}
		cw.Flush()
	}
}

func exportClientsCSV(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clients, err := d.Clients.ListByTenant(r.Context(), tenantIDFrom(r.Context()))
		if err != nil {
			d.Log.Error("export", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", `attachment; filename="clients.csv"`)
		cw := csv.NewWriter(w)
		if err := cw.Write([]string{"id", "full_name", "phone", "telegram_username", "telegram_id", "created_at"}); err != nil {
			slog.Default().Error("csv header write", "err", err)
			return
		}
		for _, c := range clients {
			fullName, phone, tgUser := "", "", ""
			if c.FullName != nil {
				fullName = *c.FullName
			}
			if c.Phone != nil {
				phone = *c.Phone
			}
			if c.TelegramUsername != nil {
				tgUser = *c.TelegramUsername
			}
			tgID := ""
			if c.TelegramID != nil {
				tgID = strconv.FormatInt(*c.TelegramID, 10)
			}
			if err := cw.Write([]string{c.ID.String(), fullName, phone, tgUser, tgID, c.CreatedAt.Format(time.RFC3339)}); err != nil {
				slog.Default().Error("csv row write", "err", err)
				return
			}
		}
		cw.Flush()
	}
}

// parseRange reads ?from=YYYY-MM-DD&to=YYYY-MM-DD; defaults to last 90 days.
func parseRange(r *http.Request) (time.Time, time.Time) {
	now := time.Now()
	from := now.AddDate(0, 0, -90)
	to := now
	if v := r.URL.Query().Get("from"); v != "" {
		if t, err := time.Parse("2006-01-02", v); err == nil {
			from = t
		}
	}
	if v := r.URL.Query().Get("to"); v != "" {
		if t, err := time.Parse("2006-01-02", v); err == nil {
			to = t.Add(24 * time.Hour)
		}
	}
	return from, to
}
