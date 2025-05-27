# Makefile 

# Project variables
BINARY_NAME = blog
CLI_BINARY_NAME = blog_cli
API_ENTRY = cmd/api/main.go
CLI_ENTRY = cmd/cli/main.go
TEMPLATE_DIR = ./cmd/web/templates
TAILWIND_INPUT = ./cmd/web/styles/input.css
TAILWIND_OUTPUT = ./cmd/web/assets/css/output.css
DOCKER_IMG_NAME = myblog
CONFIG_FILE = .blog.yaml
CONTAINER_CONFIG_PATH = /app/.blog.yaml

.PHONY: all build build-cli run run-cli gen gen-css lint test clean help build-docker watch

# Default: build and test
all: build test

# Generate Go code from Templ templates
gen:
	@command -v templ >/dev/null 2>&1 || { echo >&2 "templ is not installed. Please install it: go install github.com/a-h/templ/cmd/templ@latest"; exit 1; }
	@echo "Generating Go code from templates in $(TEMPLATE_DIR)..."
	@templ generate

# Generate CSS using Tailwind CSS
gen-css:
	@command -v tailwindcss >/dev/null 2>&1 || { echo >&2 "tailwindcss is not installed. Aborting."; exit 1; }
	@echo "Generating CSS with Tailwind CSS: $(TAILWIND_INPUT) -> $(TAILWIND_OUTPUT)"
	@tailwindcss -i $(TAILWIND_INPUT) -o $(TAILWIND_OUTPUT) --minify

# Build the main blog binary
build:
	@echo "Building blog binary: $(BINARY_NAME)"
	@go build -ldflags="-s -w" -o $(BINARY_NAME) $(API_ENTRY)

# Build CLI binary
build-cli:
	@echo "Building cli binary: $(CLI_BINARY_NAME)"
	@go build -ldflags="-s -w" -o $(CLI_BINARY_NAME) $(CLI_ENTRY)

# Build the docker image
build-docker:
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@echo "Building Docker image: $(DOCKER_IMG_NAME)"
	@docker build -t $(DOCKER_IMG_NAME) .

# Run the Docker container with mounted config file
run-docker:
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@if [ ! -f $(CONFIG_FILE) ]; then \
		echo "Config file '$(CONFIG_FILE)' not found. Aborting."; \
		exit 1; \
	fi
	@echo "Running Docker container with config file: $(CONFIG_FILE)"
	@docker run -p 8080:8080 -v $(shell pwd)/$(CONFIG_FILE):$(CONTAINER_CONFIG_PATH) $(DOCKER_IMG_NAME) --conf $(CONTAINER_CONFIG_PATH)

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
	@echo "  all           - Build and test"
	@echo "  build         - Build Blog binary"
	@echo "  build-cli     - Build CLI binary"
	@echo "  build-docker  - Build the Docker image"
	@echo "  run-docker    - Run the Docker image"
	@echo "  run           - Run Blog application"
	@echo "  run-cli       - Run CLI application"
	@echo "  gen           - Generate Go code from Templ templates"
	@echo "  gen-css       - Generate CSS with Tailwind CSS"
	@echo "  lint          - Run linter"
	@echo "  test          - Run tests"
	@echo "  clean         - Remove binaries"
	@echo "  watch         - Live reload (with Air)"
	@echo "  help          - Show this help message"
