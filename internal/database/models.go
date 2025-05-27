package database

import (
	"context"
	"errors"
	"log"

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
	Posts  PostModel
	Tags   TagModel
	Users  UserModel
	Tokens TokenModel
}

// Filter contains query filtering options
type Filter struct {
	Limit   int    // Maximum number of records to return
	Offset  int    // Number of records to skip
	Tag     string // Search via specific tag
	OrderBy string // Column to order by
	Sort    string // Sort direction (ASC/DESC)
}

// New creates a new database connection pool
func New(connStr string) *pgxpool.Pool {
	// Parse connection string into pool configuration
	poolConfig, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		log.Fatal(err)
	}

	// Create new connection pool
	db, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

// NewModels initializes all database models with the given connection pool
func NewModels(db *pgxpool.Pool) Models {
	return Models{
		Posts:  PostModel{DB: db},
		Tags:   TagModel{DB: db},
		Users:  UserModel{DB: db},
		Tokens: TokenModel{DB: db},
	}
}
