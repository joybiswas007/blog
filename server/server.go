package server

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joybiswas007/blog/config"
	"github.com/joybiswas007/blog/internal/database"
	v1 "github.com/joybiswas007/blog/server/router/api/v1"
)

type Server struct {
	port   int
	db     database.Models
	config config.Config
	logger *slog.Logger
}

func NewServer(db *pgxpool.Pool, cfg config.Config, logger *slog.Logger) *http.Server {
	NewServer := &Server{
		port:   cfg.Port,
		config: cfg,
		db:     database.NewModels(db),
		logger: logger,
	}

	v1Server := v1.NewAPIV1Service(NewServer.config, NewServer.logger, NewServer.db)

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      v1Server.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
