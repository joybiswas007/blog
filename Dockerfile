# Frontend build stage
FROM node:24.21-alpine3.24 AS frontend
WORKDIR /frontend-build
COPY web/package.json web/package-lock.json ./
RUN npm install
COPY web/ .
RUN npm run build

# Backend build stage
FROM golang:1.27.1-alpine3.24 AS backend
WORKDIR /backend-build
RUN apk --no-cache add git make build-base coreutils
ENV GOPROXY=direct
COPY go.mod go.sum ./
ENV GOCACHE=/go-cache
ENV GOMODCACHE=/gomod-cache 
COPY . .
## remove the existing dummy ui and replace with react build
COPY --from=frontend /frontend-build/dist /backend-build/server/router/frontend/dist
RUN --mount=type=cache,target=/gomod-cache --mount=type=cache,target=/go-cache \
	make build

FROM alpine:3.24.1 AS runtime
WORKDIR /app
RUN apk add --no-cache tzdata curl
ENV TZ="UTC"
COPY --from=backend /backend-build/blog /app/blog
ENTRYPOINT [ "/app/blog" ]
CMD [ "--conf", "/app/.blog.yaml" ]
