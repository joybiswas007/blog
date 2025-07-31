# Frontend build stage
FROM node:lts-alpine AS frontend
WORKDIR /frontend-build
COPY web/package.json web/package-lock.json ./
RUN npm install
COPY web/ .
RUN npm run build

# Backend build stage
FROM golang:1.24.5-alpine AS backend
WORKDIR /backend-build
RUN apk --no-cache add git
ENV GOPROXY=direct
COPY go.mod go.sum ./
ENV GOCACHE=/go-cache
ENV GOMODCACHE=/gomod-cache 
COPY . .
## remove the existing dummy ui and replace with react build
COPY --from=frontend /frontend-build/dist /backend-build/server/router/frontend/dist
RUN --mount=type=cache,target=/gomod-cache --mount=type=cache,target=/go-cache \
	go build -ldflags="-s -w" -o blog ./cmd/api/main.go

FROM alpine:latest AS runtime
WORKDIR /app
RUN apk add --no-cache tzdata curl
ENV TZ="UTC"
COPY --from=backend /backend-build/blog /app/blog
ENTRYPOINT [ "/app/blog" ]
CMD [ "--conf", "/app/.blog.yaml" ]
