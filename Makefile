# Makefile 

# Project variables
BINARY_NAME = blog
CLI_BINARY_NAME = blog_cli
API_ENTRY = cmd/api/main.go
CLI_ENTRY = cmd/cli/main.go

.PHONY: all build build-cli run run-cli lint test clean help run-docker re-build-docker watch

# Default: build and test
all: build test

# Build the main blog binary
build:
	@echo "Building blog binary: $(BINARY_NAME)"
	@go build -ldflags="-s -w" -o $(BINARY_NAME) $(API_ENTRY)

# Build CLI binary
build-cli:
	@echo "Building cli binary: $(CLI_BINARY_NAME)"
	@go build -ldflags="-s -w" -o $(CLI_BINARY_NAME) $(CLI_ENTRY)

# Build and run the docker image
build-docker:
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@mkdir -p logs
	@touch logs/blog.log
	@chmod 666 logs/blog.log
	@docker-compose up -d

# Rebuild and run docker image
re-build-docker:
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@mkdir -p logs
	@touch logs/blog.log
	@chmod 666 logs/blog.log
	@docker-compose up --build -d

# Shutdown the container
docker-down:
	@if docker compose down 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker-compose down; \
	fi

# Run the API application
run:
	@echo "Running blog from $(API_ENTRY)..."
	@go run $(API_ENTRY)

# Run the CLI application
run-cli:
	@echo "Running cli from $(CLI_ENTRY)..."
	@go run $(CLI_ENTRY)

# Run tests
test:
	@echo "Running tests..."
	@go test ./...

# Lint the codebase
lint:
	@command -v golangci-lint >/dev/null 2>&1 || { echo >&2 "golangci-lint is not installed. Aborting."; exit 1; }
	@echo "Linting code..."
	@golangci-lint run ./...

# Clean binaries and generated files
clean:
	@echo "Cleaning up binaries..."
	@rm -f $(BINARY_NAME) $(CLI_BINARY_NAME)

# Live Reload
watch:
	@if command -v air >/dev/null 2>&1; then \
		echo "Starting Air for live reload..."; \
		air; \
	else \
		echo "Go's 'air' is not installed."; \
		read -p "Do you want to install it? [Y/n] " choice; \
		if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then \
			go install github.com/air-verse/air@latest; \
			echo "Starting Air..."; \
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
