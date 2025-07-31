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

	"github.com/chenyahui/gin-cache/persist"
	"github.com/gin-contrib/cors"
	ginexp "github.com/gin-contrib/expvar"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/joybiswas007/blog/config"
	"github.com/joybiswas007/blog/internal/database"
	"github.com/joybiswas007/blog/server/router/frontend"
	sloggin "github.com/samber/slog-gin"
)

type APIV1Service struct {
	config     config.Config
	logger     *slog.Logger
	db         database.Models
	redisStore *persist.RedisStore
}

func NewAPIV1Service(cfg config.Config, logger *slog.Logger, db database.Models) *APIV1Service {
	return &APIV1Service{
		config: cfg,
		logger: logger,
		db:     db,
	}
}

func (s *APIV1Service) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(s.rateLimiter())

	if s.config.IsProduction {
		gin.SetMode(gin.ReleaseMode)
	}

	redisOptions := &redis.Options{
		Addr:     s.config.Redis.Address,
		Username: s.config.Redis.Username,
		Password: s.config.Redis.Password,
	}

	redisStore := persist.NewRedisStore(redis.NewClient(redisOptions))

	s.redisStore = redisStore

	//create a 3 second context for redis
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	redisPing, err := s.redisStore.RedisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatal(err)
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

	r.GET("robots.txt", func(c *gin.Context) {
		siteMapURL := fmt.Sprintf("%s/sitemap.xml", s.config.Blog.URL)
		robotsContent := []byte("User-agent: *\nAllow: /\nSitemap: " + siteMapURL)
		_, err := c.Writer.Write(robotsContent)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
	})
	r.GET("rss.xml", s.rssHandler)
	r.GET("sitemap.xml", s.siteMapHandler)

	// Register routes for each module
	api := r.Group("api")

	v1 := api.Group("v1")
	v1.GET("healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "OK"})
	})

	//api routes
	registerBlogRoutes(v1, s)
	registerAuthRoutes(v1, s)

	//server the frontend
	frontend.Serve(r)

	return r
}
