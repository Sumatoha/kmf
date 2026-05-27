package service

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/sumatoha/kmf/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
)

func TestHashPassword(t *testing.T) {
	hash, err := HashPassword("testpass123")
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte("testpass123")); err != nil {
		t.Error("hash does not match original password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte("wrong")); err == nil {
		t.Error("hash should not match wrong password")
	}
}

func TestJWT_IssueAndVerify(t *testing.T) {
	secret := "this-is-a-32-byte-secret-for-tests!"
	svc := &AuthService{
		jwtSecret: []byte(secret),
		ttl:       time.Hour,
	}

	user := &model.User{
		ID:       uuid.New(),
		TenantID: uuid.New(),
		Role:     model.RoleOwner,
	}

	token, err := svc.issue(user)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	if token == "" {
		t.Fatal("token is empty")
	}

	claims, err := svc.Verify(token)
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if claims.UserID != user.ID {
		t.Errorf("UserID = %v, want %v", claims.UserID, user.ID)
	}
	if claims.TenantID != user.TenantID {
		t.Errorf("TenantID = %v, want %v", claims.TenantID, user.TenantID)
	}
	if claims.Role != model.RoleOwner {
		t.Errorf("Role = %v, want %v", claims.Role, model.RoleOwner)
	}
	if claims.Issuer != "cleanops" {
		t.Errorf("Issuer = %q, want %q", claims.Issuer, "cleanops")
	}
}

func TestJWT_VerifyRejectsWrongSecret(t *testing.T) {
	svc1 := &AuthService{jwtSecret: []byte("secret-one-32-bytes-long-enough!"), ttl: time.Hour}
	svc2 := &AuthService{jwtSecret: []byte("secret-two-32-bytes-long-enough!"), ttl: time.Hour}

	user := &model.User{ID: uuid.New(), TenantID: uuid.New(), Role: model.RoleAdmin}
	token, _ := svc1.issue(user)

	if _, err := svc2.Verify(token); err == nil {
		t.Error("should reject token signed with different secret")
	}
}

func TestJWT_VerifyRejectsExpired(t *testing.T) {
	svc := &AuthService{jwtSecret: []byte("secret-32-bytes-for-testing-ok!!"), ttl: -time.Hour}

	user := &model.User{ID: uuid.New(), TenantID: uuid.New(), Role: model.RoleOwner}
	token, _ := svc.issue(user)

	if _, err := svc.Verify(token); err == nil {
		t.Error("should reject expired token")
	}
}

func TestJWT_VerifyRejectsGarbage(t *testing.T) {
	svc := &AuthService{jwtSecret: []byte("secret-32-bytes-for-testing-ok!!"), ttl: time.Hour}
	if _, err := svc.Verify("not-a-jwt"); err == nil {
		t.Error("should reject garbage token")
	}
	if _, err := svc.Verify(""); err == nil {
		t.Error("should reject empty token")
	}
}
