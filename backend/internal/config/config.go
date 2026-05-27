package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv      string
	HTTPAddr    string
	DatabaseURL string
	JWTSecret   string
	JWTTTL      time.Duration
	LogLevel    string

	CORSOrigins []string

	ClientBot BotConfig
	MasterBot BotConfig

	SessionRetention time.Duration
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
		JWTTTL:      envDuration("JWT_TTL", 7*24*time.Hour),
		LogLevel:    env("LOG_LEVEL", "info"),
		CORSOrigins: envList("CORS_ORIGINS"),
		ClientBot: BotConfig{
			Token:    env("TELEGRAM_CLIENT_BOT_TOKEN", ""),
			Username: env("TELEGRAM_CLIENT_BOT_USERNAME", "CleanOpsBookingBot"),
		},
		MasterBot: BotConfig{
			Token:    env("TELEGRAM_MASTER_BOT_TOKEN", ""),
			Username: env("TELEGRAM_MASTER_BOT_USERNAME", "CleanOpsMasterBot"),
		},
		SessionRetention: envDuration("BOT_SESSION_RETENTION", 30*24*time.Hour),
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
	if c.JWTSecret == "" || len(c.JWTSecret) < 32 {
		missing = append(missing, "JWT_SECRET (>=32 bytes)")
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

func envList(key string) []string {
	v := os.Getenv(key)
	if v == "" {
		return nil
	}
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}

func envDuration(key string, fallback time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return fallback
	}
	return d
}

