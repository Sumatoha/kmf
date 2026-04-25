package config

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv      string
	HTTPAddr    string
	DatabaseURL string
	JWTSecret   string
	LogLevel    string

	ClientBot BotConfig
	MasterBot BotConfig
}

type BotConfig struct {
	Token    string
	Username string
}

func Load() (*Config, error) {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	cfg := &Config{
		AppEnv:      env("APP_ENV", "dev"),
		HTTPAddr:    env("HTTP_ADDR", ":8080"),
		DatabaseURL: env("DATABASE_URL", ""),
		JWTSecret:   env("JWT_SECRET", ""),
		LogLevel:    env("LOG_LEVEL", "info"),
		ClientBot: BotConfig{
			Token:    env("TELEGRAM_CLIENT_BOT_TOKEN", ""),
			Username: env("TELEGRAM_CLIENT_BOT_USERNAME", "CleanOpsBookingBot"),
		},
		MasterBot: BotConfig{
			Token:    env("TELEGRAM_MASTER_BOT_TOKEN", ""),
			Username: env("TELEGRAM_MASTER_BOT_USERNAME", "CleanOpsMasterBot"),
		},
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}
	return cfg, nil
}

func (c *Config) validate() error {
	var missing []string
	if c.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if c.JWTSecret == "" || len(c.JWTSecret) < 16 {
		missing = append(missing, "JWT_SECRET (>=16 bytes)")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}
	return nil
}

func (c *Config) BotsEnabled() (client bool, master bool) {
	return c.ClientBot.Token != "", c.MasterBot.Token != ""
}

func env(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

var ErrMissingConfig = errors.New("missing required config")
