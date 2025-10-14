# Project variables
BINARY_NAME = blog
CLI_BINARY_NAME = blog_cli
API_ENTRY = cmd/api/main.go
CLI_ENTRY = cmd/cli/main.go

# Versioning variables
GIT_COMMIT = $(shell git rev-parse --short HEAD)
GIT_BRANCH = $(shell git rev-parse --abbrev-ref HEAD)
BUILD_TIME := $(shell date -u +'%Y-%m-%dT%H:%M:%S.%3NZ')

# Go linker flags to inject build-time variables
LDFLAGS = -ldflags="-s -w -X 'main.BuildCommit=$(GIT_COMMIT)' -X 'main.BuildBranch=$(GIT_BRANCH)' -X 'main.BuildTime=$(BUILD_TIME)'"


# Detect docker-compose command, preferring V2 `docker compose`
COMPOSE_V1 := $(shell command -v docker-compose)
COMPOSE_CMD := docker compose
ifeq ($(COMPOSE_V1),)
else
    # Fallback to V1 if V2 command is not available
    ifneq ($(shell docker compose version 2>/dev/null),)
    else
        COMPOSE_CMD := docker-compose
    endif
endif

.PHONY: all build build-cli run run-cli lint test clean help build-docker re-build-docker docker-down watch

# Default: build and test
all: build test

# Build the main blog binary
build:
	@echo "==> Building blog binary: $(BINARY_NAME)"
	@go build $(LDFLAGS) -o $(BINARY_NAME) $(API_ENTRY)

# Build CLI binary
build-cli:
	@echo "==> Building cli binary: $(CLI_BINARY_NAME)"
	@go build $(LDFLAGS) -o $(CLI_BINARY_NAME) $(CLI_ENTRY)

# Build and run the docker image
build-docker:
	@echo "==> Starting Docker containers..."
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@mkdir -p logs
	@touch logs/blog.log
	@chmod 666 logs/blog.log
	@$(COMPOSE_CMD) up -d

# Rebuild and run docker image
re-build-docker:
	@echo "==> Rebuilding and starting Docker containers..."
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@mkdir -p logs
	@touch logs/blog.log
	@chmod 666 logs/blog.log
	@$(COMPOSE_CMD) up --build -d

# Shutdown the container
docker-down:
	@echo "==> Shutting down Docker containers..."
	@$(COMPOSE_CMD) down

# Run the API application
run:
	@echo "==> Running blog from $(API_ENTRY)..."
	@go run $(API_ENTRY)

# Run the CLI application
run-cli:
	@echo "==> Running cli from $(CLI_ENTRY)..."
	@go run $(CLI_ENTRY)

# Run tests
test:
	@echo "==> Running tests..."
	@go test ./...

# Lint the codebase
lint:
	@command -v golangci-lint >/dev/null 2>&1 || { echo >&2 "golangci-lint is not installed. Aborting."; exit 1; }
	@echo "==> Linting code..."
	@golangci-lint run ./...

# Clean binaries and generated files
clean:
	@echo "==> Cleaning up binaries..."
	@rm -f $(BINARY_NAME) $(CLI_BINARY_NAME)

# Live Reload
watch:
	@if command -v air >/dev/null 2>&1; then \
		echo "==> Starting Air for live reload..."; \
		air; \
	else \
		echo "Go's 'air' is not installed."; \
		read -p "Do you want to install it? [Y/n] " choice; \
		if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then \
			go install github.com/air-verse/air@latest; \
			echo "==> Starting Air..."; \
			air; \
		else \
			echo "You chose not to install Air. Exiting..."; \
			exit 1; \
		fi; \
	fi

# Show help
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Common targets:"
	@echo "  all             - Build and test"
	@echo "  build           - Build Blog binary"
	@echo "  build-cli       - Build CLI binary"
	@echo "  build-docker    - Start Docker containers"
	@echo "  re-build-docker - Rebuild and start Docker containers"
	@echo "  docker-down     - Shutdown the docker container"
	@echo "  run             - Run Blog application"
	@echo "  run-cli         - Run CLI application"
	@echo "  lint            - Run linter"
	@echo "  test            - Run tests"
	@echo "  clean           - Remove binaries"
	@echo "  watch           - Live reload (with Air)"
	@echo "  help            - Show this help message"
