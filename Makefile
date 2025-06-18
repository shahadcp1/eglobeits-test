.PHONY: help install dev build start test test-watch test-cov lint format db-migrate db-reset db-studio docker-up docker-down docker-build docker-push

# Default target
help:
	@echo "Available targets:"
	@echo "  install         Install dependencies"
	@echo "  dev             Start development server"
	@echo "  build           Build the application"
	@echo "  start           Start production server"
	@echo "  test            Run tests"
	@echo "  test-watch      Run tests in watch mode"
	@echo "  test-cov        Run tests with coverage"
	@echo "  lint            Run linter"
	@echo "  format          Format code"
	@echo "  db-migrate      Run database migrations"
	@echo "  db-reset        Reset database (DANGER: deletes all data)"
	@echo "  db-studio       Open Prisma Studio"
	@echo "  docker-up       Start all services with docker-compose"
	@echo "  docker-down     Stop all services"
	@echo "  docker-build    Build all services"
	@echo "  docker-push     Push Docker images to registry"

# Install dependencies
install:
	npm ci
	npx prisma generate

# Start development server
dev:
	npm run dev

# Build the application
build:
	npm run build

# Start production server
start:
	node dist/server.js

# Run tests
test:
	npm test

# Run tests in watch mode
test-watch:
	npm run test:watch

# Run tests with coverage
test-cov:
	npm run test:cov

# Run linter
lint:
	npm run lint

# Format code
format:
	npm run format

# Run database migrations
db-migrate:
	npx prisma migrate dev

# Reset database (DANGER: deletes all data)
db-reset:
	npx prisma migrate reset --force

# Open Prisma Studio
db-studio:
	npx prisma studio

# Start all services with docker-compose
docker-up:
	docker-compose up -d

# Stop all services
docker-down:
	docker-compose down

# Build all services
docker-build:
	docker-compose build

# Push Docker images to registry
docker-push:
	echo "Pushing images to registry..."
	# Add your registry push commands here

# Show help by default
.DEFAULT_GOAL := help
