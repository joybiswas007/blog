// Package database provides PostgreSQL database access and models for the blog.
package database

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	// ErrRecordNotFound is returned when a database query finds no matching records.
	ErrRecordNotFound = errors.New("record not found")

	// ErrEditConflict is returned when a record update fails due to concurrent modification.
	ErrEditConflict = errors.New("edit conflict")

	// ErrDuplicateEmail is returned when attempting to create a user with an existing email.
	ErrDuplicateEmail = errors.New("duplicate email")
)

// Models contains all database models.
type Models struct {
	Posts PostModel
	Tags  TagModel
	Users UserModel
}

// Filter contains query filtering options.
type Filter struct {
	Limit       int    // Maximum number of records to return
	Offset      int    // Number of records to skip
	Tag         string // Search via specific tag
	OrderBy     string // Column to order by
	Sort        string // Sort direction (ASC/DESC)
	IsPublished bool   // Filter by published status: true = published, false = drafts
}

// New creates a new database connection pool.
func New(connStr string) (*pgxpool.Pool, error) {
	// Parse connection string into pool configuration
	poolConfig, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return nil, err
	}

	// Create new connection pool
	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, err
	}

	return pool, nil
}

// NewModels initializes all database models with the given connection pool.
func NewModels(pool *pgxpool.Pool) Models {
	return Models{
		Posts: PostModel{DB: pool},
		Tags:  TagModel{DB: pool},
		Users: UserModel{DB: pool, IP: IPModel{DB: pool}},
	}
}
