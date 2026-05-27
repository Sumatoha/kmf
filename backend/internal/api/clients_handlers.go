package api

import "net/http"

func listClientsHandler(d Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		items, err := d.Clients.ListByTenant(r.Context(), tenantIDFrom(r.Context()))
		if err != nil {
			d.Log.Error("list clients", "err", err)
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"items": items})
	}
}
