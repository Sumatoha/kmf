package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/sumatoha/kmf/backend/internal/api"
	"github.com/sumatoha/kmf/backend/internal/bots/client"
	"github.com/sumatoha/kmf/backend/internal/bots/master"
	"github.com/sumatoha/kmf/backend/internal/bots/shared"
	"github.com/sumatoha/kmf/backend/internal/config"
	"github.com/sumatoha/kmf/backend/internal/logger"
	"github.com/sumatoha/kmf/backend/internal/service"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		// no logger yet, write directly
		slog.New(slog.NewJSONHandler(os.Stderr, nil)).Error("config", "err", err)
		os.Exit(1)
	}
	log := logger.New(cfg.LogLevel)
	slog.SetDefault(log)

	rootCtx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	pool, err := storage.NewPool(rootCtx, cfg.DatabaseURL)
	if err != nil {
		log.Error("connect db", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	tenantRepo := storage.NewTenantRepo(pool)
	userRepo := storage.NewUserRepo(pool)
	masterRepo := storage.NewMasterRepo(pool)
	clientRepo := storage.NewClientRepo(pool)
	serviceRepo := storage.NewServiceRepo(pool)
	orderRepo := storage.NewOrderRepo(pool)
	reviewRepo := storage.NewReviewRepo(pool)
	sessionRepo := storage.NewSessionRepo(pool)

	authSvc := service.NewAuthService(userRepo, cfg.JWTSecret, 7*24*time.Hour)
	masterSvc := service.NewMasterService(masterRepo)

	// notifier wired below once bots exist; start with noop
	combined := &shared.CombinedNotifier{}
	orderSvc := service.NewOrderService(orderRepo, clientRepo, masterRepo, serviceRepo, reviewRepo, combined, log)

	// Bots
	clientBotEnabled, masterBotEnabled := cfg.BotsEnabled()
	var (
		clientBot *client.Bot
		masterBot *master.Bot
	)
	if clientBotEnabled {
		clientBot, err = client.New(cfg.ClientBot.Token, sessionRepo, tenantRepo, clientRepo, serviceRepo, orderSvc, log.With("bot", "client"))
		if err != nil {
			log.Error("init client bot", "err", err)
			os.Exit(1)
		}
		clientBot.SetOrdersRepo(orderRepo)
		combined.Client = client.NewNotifier(clientBot)
	} else {
		log.Warn("client bot disabled (no TELEGRAM_CLIENT_BOT_TOKEN)")
	}
	if masterBotEnabled {
		masterBot, err = master.New(cfg.MasterBot.Token, sessionRepo, tenantRepo, masterSvc, masterRepo, orderSvc, orderRepo, serviceRepo, log.With("bot", "master"))
		if err != nil {
			log.Error("init master bot", "err", err)
			os.Exit(1)
		}
		combined.Master = master.NewNotifier(masterBot)
	} else {
		log.Warn("master bot disabled (no TELEGRAM_MASTER_BOT_TOKEN)")
	}

	// HTTP server
	router := api.NewRouter(api.Deps{
		Auth:     authSvc,
		Orders:   orderSvc,
		Masters:  masterSvc,
		Tenants:  tenantRepo,
		Clients:  clientRepo,
		Services: serviceRepo,
		OrdersR:  orderRepo,
		Log:      log,
	})

	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	var wg sync.WaitGroup

	// HTTP
	wg.Add(1)
	go func() {
		defer wg.Done()
		log.Info("http server listening", "addr", cfg.HTTPAddr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("http server", "err", err)
			cancel()
		}
	}()

	// Bots
	if clientBot != nil {
		wg.Add(1)
		go func() {
			defer wg.Done()
			log.Info("client bot started")
			clientBot.Start(rootCtx)
		}()
	}
	if masterBot != nil {
		wg.Add(1)
		go func() {
			defer wg.Done()
			log.Info("master bot started")
			masterBot.Start(rootCtx)
		}()
	}

	<-rootCtx.Done()
	log.Info("shutting down")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	_ = srv.Shutdown(shutdownCtx)
	wg.Wait()
	log.Info("bye")
}
