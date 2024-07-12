package db

import (
	"database/sql"
	_ "github.com/microsoft/go-mssqldb"
)

var DB *sql.DB

func Init(connectionString string) error {
	var err error
	DB, err = sql.Open("sqlserver", connectionString)
	if err != nil {
		return err
	}

	if err := DB.Ping(); err != nil {
		return err
	}

	return nil
}
