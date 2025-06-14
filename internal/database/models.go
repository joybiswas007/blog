package database

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var (
	ErrRecordNotFound = errors.New("record not found")
	ErrEditConflict   = errors.New("edit conflict")
	ErrDuplicateEmail = errors.New("duplicate email")
)

// Models contains all database models
type Models struct {
	Posts PostModel
	Tags  TagModel
	Users UserModel
}

// Filter contains query filtering options
type Filter struct {
	Limit       int    // Maximum number of records to return
	Offset      int    // Number of records to skip
	Tag         string // Search via specific tag
	OrderBy     string // Column to order by
	Sort        string // Sort direction (ASC/DESC)
	IsPublished bool   // Filter by published status: true = published, false = drafts
}

// New creates a new database connection pool
func New(connStr string) (*pgxpool.Pool, error) {
	// Parse connection string into pool configuration
	poolConfig, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return nil, err
	}

	// Create new connection pool
	db, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// NewModels initializes all database models with the given connection pool
func NewModels(db *pgxpool.Pool) Models {
	return Models{
		Posts: PostModel{DB: db},
		Tags:  TagModel{DB: db},
		Users: UserModel{DB: db},
	}
}
