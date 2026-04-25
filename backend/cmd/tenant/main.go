// tenant is a CLI to create new tenants (cleaning companies).
//
// Usage:
//
//	go run ./cmd/tenant -slug=acme -name="Acme Cleaning"
//
// Slug is the short identifier embedded in client deep-links
// (t.me/CleanOpsBookingBot?start=tenant_<slug>).
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/sumatoha/kmf/backend/internal/config"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

func main() {
	var (
		slug = flag.String("slug", "", "short tenant slug (deep-link code)")
		name = flag.String("name", "", "company display name")
	)
	flag.Parse()
	if *slug == "" || *name == "" {
		flag.Usage()
		os.Exit(2)
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

	t, err := storage.NewTenantRepo(pool).Create(ctx, *slug, *name)
	if err != nil {
		log.Fatalf("create: %v", err)
	}
	fmt.Printf("created tenant %s (id=%s)\nclient deep-link: https://t.me/%s?start=tenant_%s\n",
		t.Name, t.ID, cfg.ClientBot.Username, t.Slug)
}
