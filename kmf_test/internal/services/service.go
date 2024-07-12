package services

import (
	"kmf_test/external"
	"kmf_test/internal/db"
	"log"
)

func FetchAndSaveRates(date string) error {
	rates, err := external.FetchRates(date)
	if err != nil {
		log.Printf("Failed to fetch rates: %v", err)
		return err
	}

	err = db.SaveRates(rates)
	if err != nil {
		log.Printf("Failed to save rates to db: %v", err)
		return err
	}
	return nil
}
