package shared

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

// Sessions wraps SessionRepo with JSON-encoded data helpers.
type Sessions struct {
	repo *storage.SessionRepo
	kind model.BotKind
}

func NewSessions(repo *storage.SessionRepo, kind model.BotKind) *Sessions {
	return &Sessions{repo: repo, kind: kind}
}

type Snapshot struct {
	State    string
	TenantID *uuid.UUID
	Data     map[string]any
}

func (s *Sessions) Load(ctx context.Context, chatID int64) (*Snapshot, error) {
	sess, err := s.repo.Get(ctx, s.kind, chatID)
	if errors.Is(err, storage.ErrNotFound) {
		return &Snapshot{State: "idle", Data: map[string]any{}}, nil
	}
	if err != nil {
		return nil, err
	}
	out := &Snapshot{State: sess.State, TenantID: sess.TenantID, Data: map[string]any{}}
	if len(sess.Data) > 0 {
		if err := json.Unmarshal(sess.Data, &out.Data); err != nil {
			slog.Default().Warn("session data unmarshal failed, resetting", "chat_id", chatID, "err", err)
		}
		if out.Data == nil {
			out.Data = map[string]any{}
		}
	}
	return out, nil
}

func (s *Sessions) Save(ctx context.Context, chatID int64, snap *Snapshot) error {
	if snap.Data == nil {
		snap.Data = map[string]any{}
	}
	raw, err := json.Marshal(snap.Data)
	if err != nil {
		return err
	}
	_, err = s.repo.Upsert(ctx, s.kind, chatID, snap.TenantID, snap.State, raw)
	return err
}

func (s *Sessions) Reset(ctx context.Context, chatID int64) error {
	return s.repo.Delete(ctx, s.kind, chatID)
}
