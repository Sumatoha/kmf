package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/storage"
)

type MasterService struct {
	masters *storage.MasterRepo
}

func NewMasterService(masters *storage.MasterRepo) *MasterService {
	return &MasterService{masters: masters}
}

type InviteMasterInput struct {
	TenantID uuid.UUID
	FullName string
	Phone    *string
}

type InviteMasterResult struct {
	Master      *model.Master `json:"master"`
	InviteToken string        `json:"invite_token"`
}

func (s *MasterService) Invite(ctx context.Context, in InviteMasterInput) (*InviteMasterResult, error) {
	token, err := newInviteToken()
	if err != nil {
		return nil, err
	}
	m, err := s.masters.Create(ctx, in.TenantID, in.FullName, in.Phone, token)
	if err != nil {
		return nil, err
	}
	return &InviteMasterResult{Master: m, InviteToken: token}, nil
}

func (s *MasterService) ActivateByInvite(ctx context.Context, token string, tgID int64, tgUsername *string) (*model.Master, error) {
	return s.masters.ActivateByInvite(ctx, token, tgID, tgUsername)
}

func (s *MasterService) GetByTelegram(ctx context.Context, tgID int64) (*model.Master, error) {
	return s.masters.GetByTelegramID(ctx, tgID)
}

func (s *MasterService) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]*model.Master, error) {
	return s.masters.ListByTenant(ctx, tenantID)
}

func (s *MasterService) SetAvailability(ctx context.Context, tenantID, id uuid.UUID, available bool) error {
	return s.masters.SetAvailability(ctx, tenantID, id, available)
}

func newInviteToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("rand: %w", err)
	}
	return hex.EncodeToString(b), nil
}
