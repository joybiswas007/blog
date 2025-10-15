# ==============================================================================
# Project Configuration
# ==============================================================================
BINARY_NAME = blog
CLI_BINARY_NAME = blog_cli
API_ENTRY = cmd/api/main.go
CLI_ENTRY = cmd/cli/main.go

# ==============================================================================
# Build Versioning
#
# These variables are evaluated once and used to inject build-time information
# into the Go binaries. This is useful for tracking versions and builds.
# ==============================================================================
GIT_COMMIT := $(shell git rev-parse --short HEAD)
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
# BUILD_TIME := $(shell date -u +'%Y-%m-%dT%H:%M:%S.%3NZ')
#Current UTC time in milliseconds.
BUILD_TIME := $(shell date -u +%s%3N)



# Go linker flags to inject the build-time variables.
# The `-s -w` flags strip debugging information, reducing the binary size.
LDFLAGS := -ldflags="-s -w \
	-X 'main.BuildCommit=$(GIT_COMMIT)' \
	-X 'main.BuildBranch=$(GIT_BRANCH)' \
	-X 'main.BuildTime=$(BUILD_TIME)'"

# ==============================================================================
# Tooling Configuration
#
# Simplified detection for the docker-compose command. Prefers the modern
# `docker compose` (V2) and falls back to `docker-compose` (V1) if not found.
# ==============================================================================
ifneq (, $(shell docker compose version 2>/dev/null))
	COMPOSE_CMD = docker compose
else
	COMPOSE_CMD = docker-compose
endif


# ==============================================================================
# Targets
# ==============================================================================
.PHONY: all build build-cli run run-cli lint test clean help build-docker re-build-docker docker-down watch docker-setup

# Default target: build the main binary and run tests.
all: build test

# ------------------------------------------------------------------------------
# Build Targets
# ------------------------------------------------------------------------------
# Build the main API binary.
build:
	@echo "==> Building API binary: $(BINARY_NAME)"
	@go build $(LDFLAGS) -o $(BINARY_NAME) $(API_ENTRY)

# Build the command-line interface (CLI) binary.
build-cli:
	@echo "==> Building CLI binary: $(CLI_BINARY_NAME)"
	@go build $(LDFLAGS) -o $(CLI_BINARY_NAME) $(CLI_ENTRY)

# ------------------------------------------------------------------------------
# Run Targets
# ------------------------------------------------------------------------------
# Run the API application directly.
run:
	@echo "==> Running API from $(API_ENTRY)..."
	@go run $(API_ENTRY)

# Run the CLI application directly.
run-cli:
	@echo "==> Running CLI from $(CLI_ENTRY)..."
	@go run $(CLI_ENTRY)

# ------------------------------------------------------------------------------
# Docker Targets
#
# The common setup logic has been moved to a `docker-setup` prerequisite to
# avoid repetition between `build-docker` and `re-build-docker`.
# ------------------------------------------------------------------------------
# Build and run the docker containers.
build-docker: docker-setup
	@echo "==> Starting Docker containers..."
	@$(COMPOSE_CMD) up -d

# Rebuild and run the docker containers.
re-build-docker: docker-setup
	@echo "==> Rebuilding and starting Docker containers..."
	@$(COMPOSE_CMD) up --build -d

# Shut down and remove the docker containers.
docker-down:
	@echo "==> Shutting down Docker containers..."
	@$(COMPOSE_CMD) down

# Prerequisite target for Docker commands to ensure the environment is ready.
docker-setup:
	@echo "==> Preparing Docker environment..."
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@command -v $(COMPOSE_CMD) >/dev/null 2>&1 || { echo >&2 "Docker Compose ($(COMPOSE_CMD)) could not be found. Aborting."; exit 1; }
	@mkdir -p logs
	@touch logs/blog.log
	@chmod 666 logs/blog.log

# ------------------------------------------------------------------------------
# Development & QA
# ------------------------------------------------------------------------------
# Run all tests in the project.
test:
	@echo "==> Running tests..."
	@go test ./...

# Lint the codebase using golangci-lint.
lint:
	@command -v golangci-lint >/dev/null 2>&1 || { echo >&2 "golangci-lint is not installed. Please run: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; exit 1; }
	@echo "==> Linting code..."
	@golangci-lint run ./...

# Live reload using Air.
# Removed interactive install. It's better practice to fail with a clear
# message instructing the user how to install the missing dependency.
watch:
	@if ! command -v air >/dev/null 2>&1; then \
		echo "ERROR: Air is not installed. It is required for live reloading."; \
		echo "Please run: go install github.com/air-verse/air@latest"; \
		exit 1; \
	fi
	@echo "==> Starting Air for live reload...";
	@air

# ------------------------------------------------------------------------------
# Housekeeping
# ------------------------------------------------------------------------------
# Clean up built binaries.
clean:
	@echo "==> Cleaning up binaries..."
	@rm -f $(BINARY_NAME) $(CLI_BINARY_NAME)

# Show a helpful message with all available targets.
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  all             Build and test the application"
	@echo "  build           Build the main API binary"
	@echo "  build-cli       Build the CLI binary"
	@echo "  run             Run the main API application"
	@echo "  run-cli         Run the CLI application"
	@echo "  watch           Live reload the application using Air"
	@echo ""
	@echo "  build-docker    Start Docker containers"
	@echo "  re-build-docker Rebuild and start Docker containers"
	@echo "  docker-down     Shutdown the Docker containers"
	@echo ""
	@echo "  test            Run all tests"
	@echo "  lint            Run the linter"
	@echo "  clean           Remove built binaries"
	@echo "  help            Show this help message"

