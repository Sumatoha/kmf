package main

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"kmf_test/internal/db"
	"kmf_test/internal/handlers"
	"log"
	"net/http"
	"os"
)

type Config struct {
	Port             string `json:"port"`
	ConnectionString string `json:"connectionString"`
}

func main() {
	config := initConfig()
	initDB(config.ConnectionString)
	runServer(config.Port)
}

func initConfig() Config {
	file, err := os.Open("config/config.json")
	if err != nil {
		log.Fatalf("Error opening config file: %v", err)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	config := Config{}
	err = decoder.Decode(&config)
	if err != nil {
		log.Fatalf("Error decoding config file: %v", err)
	}

	return config
}

func initDB(connectionString string) {
	db.Init(connectionString)
	db.RunMigrations(connectionString)
}

func runServer(port string) {
	router := mux.NewRouter()
	router.HandleFunc("/currency/save/{date}", handlers.SaveRatesHandler).Methods("GET")
	router.HandleFunc("/currency/{date}/{code}", handlers.GetRatesHandler).Methods("GET")
	router.HandleFunc("/currency/{date}", handlers.GetRatesHandler).Methods("GET")

	log.Printf("Server starting on port %s...", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
