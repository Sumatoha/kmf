.PHONY: help up down logs psql migrate-up migrate-down migrate-create run tidy build admin tenant docker-build web-install web-dev web-build

DB_URL ?= postgres://cleanops:cleanops_dev@localhost:5432/cleanops?sslmode=disable
MIGRATIONS_DIR = backend/migrations

help:
	@echo "make up              - start postgres in docker"
	@echo "make down            - stop docker"
	@echo "make psql            - psql shell into local db"
	@echo "make migrate-up      - apply migrations"
	@echo "make migrate-down    - rollback last migration"
	@echo "make migrate-create name=foo - create migration"
	@echo "make admin email=... password=... name=...  - create admin user"
	@echo "make run             - run backend"
	@echo "make web-install     - install frontend deps"
	@echo "make web-dev         - run Next.js dev server"
	@echo "make web-dev         - run Next.js dev server"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f postgres

psql:
	docker exec -it cleanops-postgres psql -U cleanops -d cleanops

migrate-up:
	migrate -path $(MIGRATIONS_DIR) -database "$(DB_URL)" up

migrate-down:
	migrate -path $(MIGRATIONS_DIR) -database "$(DB_URL)" down 1

migrate-create:
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq $(name)

tidy:
	cd backend && go mod tidy

run:
	cd backend && go run ./cmd/server

build:
	cd backend && go build -o bin/server ./cmd/server

admin:
	cd backend && go run ./cmd/admin -email=$(email) -password=$(password) -name="$(name)" -tenant-slug=$(or $(slug),demo)

tenant:
	cd backend && go run ./cmd/tenant -slug=$(slug) -name="$(name)"

docker-build:
	docker build -t cleanops/backend ./backend

web-install:
	cd web && npm install

web-dev:
	cd web && npm run dev

web-build:
	cd web && npm run build
