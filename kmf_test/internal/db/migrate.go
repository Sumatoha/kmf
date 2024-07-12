package db

import (
	"database/sql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlserver"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(connectionString string) error {
	db, err := sql.Open("sqlserver", connectionString)
	if err != nil {
		return err
	}
	defer db.Close()

	driver, err := sqlserver.WithInstance(db, &sqlserver.Config{})
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://db/migrations",
		"sqlserver", driver)
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}

	return nil
}
