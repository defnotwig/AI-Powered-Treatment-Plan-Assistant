.PHONY: dev build test lint clean docker-up docker-down

## Start full-stack development servers
dev:
	@echo "Starting backend..."
	cd Backend && npm run dev &
	@echo "Starting frontend..."
	cd Frontend && npm run dev

## Run all tests
test:
	cd Frontend && npm test -- --run
	cd Backend && npm test

## Lint all code
lint:
	cd Frontend && npm run lint

## Production build
build:
	cd Frontend && npm run build
	cd Backend && npm run build

## Docker Compose up
docker-up:
	docker compose up --build -d

## Docker Compose down
docker-down:
	docker compose down

## Install all dependencies
install:
	cd Frontend && npm ci
	cd Backend && npm ci

## Clean build artifacts
clean:
	rm -rf Frontend/dist Backend/dist
