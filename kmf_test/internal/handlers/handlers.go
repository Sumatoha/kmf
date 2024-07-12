package handlers

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"kmf_test/internal/db"
	"kmf_test/internal/services"
	"log"
	"net/http"
)

func SaveRatesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	date := vars["date"]

	err := services.FetchAndSaveRates(date)
	if err != nil {
		log.Printf("Error in FetchAndSaveRates: %v", err)
		http.Error(w, "Failed to fetch and save rates", http.StatusInternalServerError)
		return
	}
	responseJSON(w, map[string]bool{"success": true})
}

func GetRatesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	date := vars["date"]
	code := vars["code"]

	rates, err := db.GetRates(date, code)
	if err != nil {
		http.Error(w, "Failed to fetch data from database", http.StatusInternalServerError)
		return
	}

	responseJSON(w, rates)
}

func responseJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
