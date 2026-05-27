package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
	"github.com/sumatoha/kmf/backend/internal/storage"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserInactive       = errors.New("user is inactive")
	ErrSlugTaken          = errors.New("tenant slug already taken")
	ErrEmailTaken         = errors.New("email already registered")
)

type AuthService struct {
	users     *storage.UserRepo
	tenants   *storage.TenantRepo
	services  *storage.ServiceRepo
	jwtSecret []byte
	ttl       time.Duration
}

func NewAuthService(users *storage.UserRepo, tenants *storage.TenantRepo, services *storage.ServiceRepo, jwtSecret string, ttl time.Duration) *AuthService {
	if ttl == 0 {
		ttl = 7 * 24 * time.Hour
	}
	return &AuthService{users: users, tenants: tenants, services: services, jwtSecret: []byte(jwtSecret), ttl: ttl}
}

type Claims struct {
	UserID   uuid.UUID       `json:"uid"`
	TenantID uuid.UUID       `json:"tid"`
	Role     model.UserRole  `json:"role"`
	jwt.RegisteredClaims
}

type LoginResult struct {
	Token string      `json:"token"`
	User  *model.User `json:"user"`
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*LoginResult, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if errors.Is(err, storage.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}
	if !user.IsActive {
		return nil, ErrUserInactive
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}
	tok, err := s.issue(user)
	if err != nil {
		return nil, err
	}
	return &LoginResult{Token: tok, User: user}, nil
}

func (s *AuthService) issue(user *model.User) (string, error) {
	claims := Claims{
		UserID:   user.ID,
		TenantID: user.TenantID,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID.String(),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(s.jwtSecret)
}

func (s *AuthService) Verify(token string) (*Claims, error) {
	claims := &Claims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.jwtSecret, nil
	})
	if err != nil || !parsed.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

type RegisterInput struct {
	TenantSlug string
	TenantName string
	Email      string
	Password   string
	FullName   string
}

// Register creates a new tenant with an owner user and seeds 3 default
// services so the company can start taking bookings immediately. Returns
// a login token for the new owner.
func (s *AuthService) Register(ctx context.Context, in RegisterInput) (*LoginResult, error) {
	in.TenantSlug = strings.ToLower(strings.TrimSpace(in.TenantSlug))
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	if !slugRe.MatchString(in.TenantSlug) {
		return nil, fmt.Errorf("invalid slug (use a-z, 0-9, dashes; 3-32 chars)")
	}
	if len(in.Password) < 6 {
		return nil, fmt.Errorf("password must be at least 6 characters")
	}

	if _, err := s.tenants.GetBySlug(ctx, in.TenantSlug); err == nil {
		return nil, ErrSlugTaken
	} else if !errors.Is(err, storage.ErrNotFound) {
		return nil, err
	}
	if _, err := s.users.GetByEmail(ctx, in.Email); err == nil {
		return nil, ErrEmailTaken
	} else if !errors.Is(err, storage.ErrNotFound) {
		return nil, err
	}

	tenant, err := s.tenants.Create(ctx, in.TenantSlug, in.TenantName)
	if err != nil {
		return nil, fmt.Errorf("create tenant: %w", err)
	}
	hash, err := HashPassword(in.Password)
	if err != nil {
		return nil, err
	}
	user, err := s.users.Create(ctx, tenant.ID, in.Email, hash, in.FullName, model.RoleOwner)
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	if s.services != nil {
		if err := seedDefaultServices(ctx, s.services, tenant.ID); err != nil {
			return nil, fmt.Errorf("seed services: %w", err)
		}
	}
	tok, err := s.issue(user)
	if err != nil {
		return nil, err
	}
	return &LoginResult{Token: tok, User: user}, nil
}

var slugRe = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$`)

func seedDefaultServices(ctx context.Context, repo *storage.ServiceRepo, tenantID uuid.UUID) error {
	defaults := []struct {
		name     string
		desc     string
		price    float64
		duration int
	}{
		{"Стандартная уборка", "Регулярная уборка квартиры", 3500, 120},
		{"Генеральная уборка", "Тщательная уборка всех поверхностей", 7500, 300},
		{"Уборка после ремонта", "Уборка строительной пыли и мусора", 12000, 480},
	}
	for _, d := range defaults {
		desc := d.desc
		if _, err := repo.Create(ctx, tenantID, d.name, &desc, d.price, d.duration); err != nil {
			return fmt.Errorf("seed %q: %w", d.name, err)
		}
	}
	return nil
}

func HashPassword(password string) (string, error) {
	h, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(h), nil
}
