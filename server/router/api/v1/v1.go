// Package v1 provides HTTP handlers for the blog API version 1 endpoints.
package v1

import (
	"context"
	"expvar"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"runtime"
	"time"

	cache "github.com/chenyahui/gin-cache"
	"github.com/chenyahui/gin-cache/persist"
	"github.com/gin-contrib/cors"
	ginexp "github.com/gin-contrib/expvar"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	sloggin "github.com/samber/slog-gin"

	"github.com/joybiswas007/blog/config"
	"github.com/joybiswas007/blog/internal/database"
	"github.com/joybiswas007/blog/server/router/frontend"
)

// APIV1Service handles all API v1 endpoints and dependencies.
type APIV1Service struct {
	config     *config.Config
	logger     *slog.Logger
	db         database.Models
	redisStore *persist.RedisStore
}

// NewAPIV1Service creates a new API v1 service instance.
func NewAPIV1Service(cfg *config.Config, logger *slog.Logger, db database.Models) *APIV1Service {
	return &APIV1Service{
		config: cfg,
		logger: logger,
		db:     db,
	}
}

// RegisterRoutes configures and returns an HTTP handler with all API v1 routes.
func (s *APIV1Service) RegisterRoutes() http.Handler {
	r := gin.Default()

	if s.config.IsProduction {
		gin.SetMode(gin.ReleaseMode)
		r.Use(s.CheckIP())
	}
	r.Use(s.RateLimiter())

	redisOptions := &redis.Options{
		Addr:     s.config.Redis.Address,
		Username: s.config.Redis.Username,
		Password: s.config.Redis.Password,
	}

	redisStore := persist.NewRedisStore(redis.NewClient(redisOptions))

	s.redisStore = redisStore

	// create a 3 second context for redis.
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	redisPing, err := s.redisStore.RedisClient.Ping(ctx).Result()
	if err != nil {
		log.Panic(err)
	}

	fmt.Println("Redis ping:", redisPing)

	r.Use(sloggin.NewWithConfig(s.logger, sloggin.Config{
		WithUserAgent:    true,
		DefaultLevel:     slog.LevelInfo,
		ClientErrorLevel: slog.LevelWarn,
		ServerErrorLevel: slog.LevelError,
	}))

	if !s.config.IsProduction {
		// Publish the number of active goroutines.
		expvar.Publish("goroutines", expvar.Func(func() any {
			return runtime.NumGoroutine()
		}))
		// Publish the current Unix timestamp.
		expvar.Publish("timestamp", expvar.Func(func() any {
			return time.Now().Unix()
		}))
		r.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:3001"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
			AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
			AllowCredentials: true,
		}))

		r.GET("debug/vars", ginexp.Handler())
	}
	r.GET("rss.xml", s.rssHandler)
	r.GET("sitemap.xml", s.siteMapHandler)

	// Register routes for each module.
	api := r.Group("api")

	v1 := api.Group("v1")
	v1.GET("healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "OK"})
	})
	v1.GET("build-info", cache.CacheByRequestURI(s.redisStore, 365*24*time.Hour), s.buildInfoHandler)

	// api routes
	registerBlogRoutes(v1, s)
	registerAuthRoutes(v1, s)

	// server the frontend
	frontend.Serve(r)

	return r
}
