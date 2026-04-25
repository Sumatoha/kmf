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
	if err := run(); err != nil {
		slog.New(slog.NewJSONHandler(os.Stderr, nil)).Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	log := logger.New(cfg.LogLevel)
	slog.SetDefault(log)
	log.Info("starting cleanops", "env", cfg.AppEnv, "addr", cfg.HTTPAddr)

	rootCtx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	pool, err := storage.NewPool(rootCtx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()
	log.Info("database connected")

	tenantRepo := storage.NewTenantRepo(pool)
	userRepo := storage.NewUserRepo(pool)
	masterRepo := storage.NewMasterRepo(pool)
	clientRepo := storage.NewClientRepo(pool)
	serviceRepo := storage.NewServiceRepo(pool)
	orderRepo := storage.NewOrderRepo(pool)
	reviewRepo := storage.NewReviewRepo(pool)
	sessionRepo := storage.NewSessionRepo(pool)
	webhookRepo := storage.NewWebhookRepo(pool)

	authSvc := service.NewAuthService(userRepo, tenantRepo, serviceRepo, cfg.JWTSecret, cfg.JWTTTL)
	masterSvc := service.NewMasterService(masterRepo)
	webhookSvc := service.NewWebhookService(webhookRepo, log.With("svc", "webhook"))

	combined := &shared.CombinedNotifier{}
	orderSvc := service.NewOrderService(orderRepo, clientRepo, masterRepo, serviceRepo, reviewRepo, combined, webhookSvc, log)
	reminderSvc := service.NewRemindersService(orderRepo, clientRepo, masterRepo, combined, webhookSvc, log.With("svc", "reminders"))

	clientBotEnabled, masterBotEnabled := cfg.BotsEnabled()
	var (
		clientBot *client.Bot
		masterBot *master.Bot
	)
	if clientBotEnabled {
		clientBot, err = client.New(client.Deps{
			Token:    cfg.ClientBot.Token,
			Sessions: sessionRepo,
			Tenants:  tenantRepo,
			Clients:  clientRepo,
			Services: serviceRepo,
			OrdersR:  orderRepo,
			Orders:   orderSvc,
			Log:      log.With("bot", "client"),
		})
		if err != nil {
			return err
		}
		combined.Client = client.NewNotifier(clientBot)
	} else {
		log.Warn("client bot disabled (no TELEGRAM_CLIENT_BOT_TOKEN)")
	}
	if masterBotEnabled {
		masterBot, err = master.New(master.Deps{
			Token:    cfg.MasterBot.Token,
			Sessions: sessionRepo,
			Tenants:  tenantRepo,
			Masters:  masterSvc,
			MastersR: masterRepo,
			Orders:   orderSvc,
			OrdersR:  orderRepo,
			Services: serviceRepo,
			Log:      log.With("bot", "master"),
		})
		if err != nil {
			return err
		}
		combined.Master = master.NewNotifier(masterBot)
	} else {
		log.Warn("master bot disabled (no TELEGRAM_MASTER_BOT_TOKEN)")
	}

	router := api.NewRouter(api.Deps{
		Auth:        authSvc,
		Orders:      orderSvc,
		Masters:     masterSvc,
		Webhooks:    webhookSvc,
		Tenants:     tenantRepo,
		Clients:     clientRepo,
		Services:    serviceRepo,
		OrdersR:     orderRepo,
		MastersR:    masterRepo,
		Pool:        pool,
		Log:         log,
		CORSOrigins: cfg.CORSOrigins,
	})

	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		log.Info("http listening", "addr", cfg.HTTPAddr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("http server", "err", err)
			cancel()
		}
	}()

	if clientBot != nil {
		wg.Add(1)
		go func() {
			defer wg.Done()
			log.Info("client bot started", "username", cfg.ClientBot.Username)
			clientBot.Start(rootCtx)
		}()
	}
	if masterBot != nil {
		wg.Add(1)
		go func() {
			defer wg.Done()
			log.Info("master bot started", "username", cfg.MasterBot.Username)
			masterBot.Start(rootCtx)
		}()
	}

	// Background workers.
	wg.Add(1)
	go func() {
		defer wg.Done()
		runSessionGC(rootCtx, sessionRepo, cfg.SessionRetention, log.With("task", "session_gc"))
	}()
	wg.Add(1)
	go func() {
		defer wg.Done()
		log.Info("reminders started")
		reminderSvc.Run(rootCtx)
	}()
	wg.Add(1)
	go func() {
		defer wg.Done()
		log.Info("webhook dispatcher started")
		webhookSvc.RunDispatcher(rootCtx, nil)
	}()

	<-rootCtx.Done()
	log.Info("shutting down")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	_ = srv.Shutdown(shutdownCtx)
	wg.Wait()
	log.Info("bye")
	return nil
}

func runSessionGC(ctx context.Context, sessions *storage.SessionRepo, retention time.Duration, log *slog.Logger) {
	tick := time.NewTicker(time.Hour)
	defer tick.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-tick.C:
			n, err := sessions.DeleteStale(ctx, retention)
			if err != nil {
				log.Warn("delete stale", "err", err)
				continue
			}
			if n > 0 {
				log.Info("pruned stale sessions", "count", n)
			}
		}
	}
}
