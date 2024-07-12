package db

import (
	"kmf_test/internal/models"
	"log"
)

func SaveRates(rates models.Rates) error {
	for _, rate := range rates.Items {
		_, err := DB.Exec(
			"INSERT INTO R_CURRENCY (TITLE, CODE, VALUE, A_DATE) VALUES (@p1, @p2, @p3, @p4)",
			rate.Fullname, rate.Title, rate.Description, rates.Date,
		)
		if err != nil {
			log.Printf("Error inserting data into database: %v", err)
			return err
		}
	}

	return nil
}

func GetRates(date, code string) ([]models.Rate, error) {
	query := "SELECT TITLE, CODE, VALUE FROM R_CURRENCY WHERE A_DATE = @p1"
	args := []interface{}{date}
	if code != "" {
		query += " AND CODE = @p2"
		args = append(args, code)
	}

	rows, err := DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.Rate
	for rows.Next() {
		var rate models.Rate
		if err := rows.Scan(&rate.Fullname, &rate.Title, &rate.Description); err != nil {
			return nil, err
		}
		results = append(results, rate)
	}

	return results, nil
}
