package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joybiswas007/blog/config"
	"github.com/joybiswas007/blog/internal/database"
	"github.com/joybiswas007/blog/internal/server"
)

func main() {
	var cfgFile string

	flag.StringVar(&cfgFile, "conf", "", "Path to configuration file (default: $PWD/.blog.yaml)")
	flag.Parse()

	config.Init(cfgFile)

	logFile, err := os.OpenFile("blog.log", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer logFile.Close()

	logger := slog.New(slog.NewJSONHandler(logFile, nil))

	cfg, err := config.GetAll()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.New(cfg.DB)
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		log.Println("Disconnected from database")
		db.Close()
	}()

	srv := server.NewServer(db, cfg, logger)
	// Create a done channel to signal when the shutdown is complete
	done := make(chan bool, 1)

	// Run graceful shutdown in a separate goroutine
	go gracefulShutdown(srv, done)

	err = srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}
	// Wait for the graceful shutdown to complete
	<-done
	log.Println("Graceful shutdown complete.")
}

func gracefulShutdown(apiServer *http.Server, done chan bool) {
	// Listen for interrupt signals (SIGINT, SIGTERM)
	sigCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Block until a signal is received
	<-sigCtx.Done()
	log.Println("Shutting down gracefully, press Ctrl+C again to force")

	// Create a new context for server shutdown timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := apiServer.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server forced to shutdown with error: %v", err)
	}

	log.Println("Server exiting")

	// Notify main goroutine that shutdown is complete
	done <- true
}
