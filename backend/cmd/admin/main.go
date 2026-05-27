// admin is a tiny CLI to bootstrap the first admin account.
//
// Usage:
//
//	go run ./cmd/admin -email=you@co -password=secret -name="Your Name" -tenant-slug=demo
//
// Reads DATABASE_URL from env / .env.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/sumatoha/kmf/backend/internal/config"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/service"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

func main() {
	var (
		email    = flag.String("email", "", "admin email")
		password = flag.String("password", "", "admin password (>= 8 chars)")
		fullName = flag.String("name", "Admin", "full name")
		slug     = flag.String("tenant-slug", "demo", "tenant slug to attach to")
		role     = flag.String("role", "owner", "owner | admin | dispatcher")
	)
	flag.Parse()
	if *email == "" || *password == "" {
		flag.Usage()
		os.Exit(2)
	}
	if len(*password) < 8 {
		log.Fatal("password must be at least 8 characters")
	}
	if !model.UserRole(*role).Valid() {
		log.Fatalf("invalid role %q: must be owner, admin, or dispatcher", *role)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := storage.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	defer pool.Close()

	tenants := storage.NewTenantRepo(pool)
	users := storage.NewUserRepo(pool)

	tenant, err := tenants.GetBySlug(ctx, *slug)
	if errors.Is(err, storage.ErrNotFound) {
		log.Fatalf("tenant with slug %q not found — create it first", *slug)
	}
	if err != nil {
		log.Fatalf("get tenant: %v", err)
	}

	hash, err := service.HashPassword(*password)
	if err != nil {
		log.Fatalf("hash: %v", err)
	}

	user, err := users.Create(ctx, tenant.ID, *email, hash, *fullName, model.UserRole(*role))
	if err != nil {
		log.Fatalf("create user: %v", err)
	}

	fmt.Printf("created user %s (%s) in tenant %s\n", user.Email, user.ID, tenant.Slug)
}
