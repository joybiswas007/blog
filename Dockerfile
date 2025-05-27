# Stage 1: Templ code generation
FROM ghcr.io/a-h/templ:latest AS templgen
WORKDIR /app
COPY --chown=65532:65532 . /app
RUN ["templ", "generate"]

# Stage 2: Build stage
FROM golang:1.24.3-bullseye AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y make

# Download TailwindCSS using ADD (better cacheable)
ADD https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64 /usr/local/bin/tailwindcss
RUN chmod +x /usr/local/bin/tailwindcss

WORKDIR /app

# Set Go proxy to direct
ENV GOPROXY=direct

# Copy Go mod files and download dependencies
COPY go.mod go.sum ./

# Set cache
ENV GOCACHE=/go-cache
ENV GOMODCACHE=/gomod-cache 

# Copy the rest of the source code
COPY . .

# Overwrite with Templ-generated files from stage 1
COPY --from=templgen /app /app

# Generate TailwindCSS output
RUN make gen-css 

# Build statically linked, optimized binary
RUN --mount=type=cache,target=/gomod-cache --mount=type=cache,target=/go-cache \
	make build

# Stage 3: Minimal runtime image
FROM alpine:latest

# Create non-root user
RUN adduser --disabled-password appuser

# Set working directory
WORKDIR /app

# Copy compiled binary and assets from builder
COPY --from=builder /app/blog /app/blog
COPY --from=builder /app/cmd/web/assets /app/cmd/web/assets

# Ensure correct permissions
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose port
EXPOSE 8080

# Start the application
CMD ["./blog"]
