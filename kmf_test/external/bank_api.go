package external

import (
	"encoding/xml"
	"fmt"
	"io"
	"kmf_test/internal/models"
	"log"
	"net/http"
)

func FetchRates(date string) (models.Rates, error) {
	url := fmt.Sprintf("https://nationalbank.kz/rss/get_rates.cfm?fdate=%s", date)

	response, err := http.Get(url)
	if err != nil {
		log.Printf("Failed to fetch data from National Bank API: %v", err)
		return models.Rates{}, err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		log.Printf("Failed to read response body: %v", err)
		return models.Rates{}, err
	}

	var rates models.Rates
	if err = xml.Unmarshal(body, &rates); err != nil {
		log.Printf("Failed to parse XML: %v", err)
		return models.Rates{}, err
	}

	return rates, nil
}
