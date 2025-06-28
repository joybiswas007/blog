package v1

import (
	"expvar"
	"fmt"
	"log/slog"
	"net/http"
	"runtime"
	"time"

	"github.com/gin-contrib/cors"
	ginexp "github.com/gin-contrib/expvar"
	"github.com/gin-gonic/gin"
	"github.com/joybiswas007/blog/config"
	"github.com/joybiswas007/blog/internal/database"
	"github.com/joybiswas007/blog/server/router/frontend"
	sloggin "github.com/samber/slog-gin"
)

type APIV1Service struct {
	config config.Config
	logger *slog.Logger
	db     database.Models
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

	r.Use(sloggin.NewWithConfig(s.logger, sloggin.Config{
		WithUserAgent:    true,
		DefaultLevel:     slog.LevelInfo,
		ClientErrorLevel: slog.LevelWarn,
		ServerErrorLevel: slog.LevelError,
	}))

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Add your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
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
		r.GET("debug/vars", ginexp.Handler())
	}
	r.NoMethod(func(c *gin.Context) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Method not allowed"})
	})
	r.GET("robots.txt", func(c *gin.Context) {
		siteMapURL := fmt.Sprintf("%s/sitemap.xml", s.config.Blog.URL)
		robotsContent := []byte("User-agent: *\nAllow: /\nSitemap: " + siteMapURL)
		_, err := c.Writer.Write(robotsContent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, err.Error())
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

	registerBlogRoutes(v1, s)

	//api routes
	registerAuthRoutes(v1, s)

	//server the frontend
	frontend.Serve(r)

	return r
}
