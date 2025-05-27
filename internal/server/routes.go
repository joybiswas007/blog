package server

import (
	"expvar"
	"io/fs"
	"log"
	"log/slog"
	"net/http"
	"runtime"
	"time"

	"github.com/gin-contrib/cors"
	ginexp "github.com/gin-contrib/expvar"
	"github.com/gin-gonic/gin"
	"github.com/joybiswas007/blog/cmd/web"
	sloggin "github.com/samber/slog-gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	staticFiles, err := fs.Sub(web.Files, "assets")
	if err != nil {
		log.Fatal(err)
	}
	r.StaticFS("/assets", http.FS(staticFiles))

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

	api := r.Group("api")

	api.GET("", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "OK"})
	})

	v1 := api.Group("v1")

	// Register routes for each module
	registerBlogRoutes(r, s)

	//api routes
	registerAuthRoutes(v1, s)
	registerPostRoutes(v1, s)

	return r
}
