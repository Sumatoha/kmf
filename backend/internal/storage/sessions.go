package storage

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sumatoha/kmf/backend/internal/model"
)

type SessionRepo struct{ pool *pgxpool.Pool }

func NewSessionRepo(pool *pgxpool.Pool) *SessionRepo { return &SessionRepo{pool: pool} }

const sessionCols = "id, kind, chat_id, tenant_id, state, data, updated_at"

func scanSession(row interface {
	Scan(...any) error
}) (*model.BotSession, error) {
	var s model.BotSession
	if err := row.Scan(&s.ID, &s.Kind, &s.ChatID, &s.TenantID, &s.State, &s.Data, &s.UpdatedAt); err != nil {
		return nil, wrapNotFound(err)
	}
	return &s, nil
}

func (r *SessionRepo) Get(ctx context.Context, kind model.BotKind, chatID int64) (*model.BotSession, error) {
	row := r.pool.QueryRow(ctx,
		`SELECT `+sessionCols+` FROM bot_sessions WHERE kind = $1 AND chat_id = $2`, kind, chatID)
	return scanSession(row)
}

func (r *SessionRepo) Upsert(ctx context.Context, kind model.BotKind, chatID int64, tenantID *uuid.UUID, state string, data []byte) (*model.BotSession, error) {
	if data == nil {
		data = []byte("{}")
	}
	row := r.pool.QueryRow(ctx, `
		INSERT INTO bot_sessions (kind, chat_id, tenant_id, state, data)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (kind, chat_id) DO UPDATE
		SET tenant_id = COALESCE(EXCLUDED.tenant_id, bot_sessions.tenant_id),
		    state = EXCLUDED.state,
		    data = EXCLUDED.data,
		    updated_at = NOW()
		RETURNING `+sessionCols, kind, chatID, tenantID, state, data)
	return scanSession(row)
}

func (r *SessionRepo) Delete(ctx context.Context, kind model.BotKind, chatID int64) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM bot_sessions WHERE kind = $1 AND chat_id = $2`, kind, chatID)
	return err
}

// DeleteStale removes sessions untouched for at least olderThan duration.
// Returns the number of rows removed for observability.
func (r *SessionRepo) DeleteStale(ctx context.Context, olderThan time.Duration) (int64, error) {
	cmd, err := r.pool.Exec(ctx,
		`DELETE FROM bot_sessions WHERE updated_at < NOW() - (INTERVAL '1 second' * $1)`,
		int64(olderThan.Seconds()))
	if err != nil {
		return 0, err
	}
	return cmd.RowsAffected(), nil
}
