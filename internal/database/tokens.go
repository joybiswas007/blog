package database

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Define the TokenModel type.
type TokenModel struct {
	DB *pgxpool.Pool
}

// Token represents a session or authentication token for a user.
type Token struct {
	ID           int       `json:"id"`            // Unique identifier for the token
	UserID       int64     `json:"user_id"`       // ID of the user the token belongs to
	AccessToken  string    `json:"access_token"`  // Short-lived JWT access token
	RefreshToken string    `json:"refresh_token"` // Long-lived refresh token (must be unique)
	Revoked      bool      `json:"revoked"`       // Indicates if the token has been revoked
	CreatedAt    time.Time `json:"created_at"`    // Timestamp of token creation
	UpdatedAt    time.Time `json:"updated_at"`    // Timestamp of last token update
}

// Insert the newly generated token for the user
func (m TokenModel) Insert(token Token) error {
	query := `INSERT INTO tokens(user_id, access_token, refresh_token) VALUES($1, $2, $3)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.Exec(ctx, query, token.UserID, token.AccessToken, token.RefreshToken)
	if err != nil {
		return err
	}

	return nil
}

// Logout revokes all tokens associated with the given user ID.
func (m TokenModel) Logout(userID int64) error {
	query := `
		UPDATE tokens
		SET revoked = TRUE
		WHERE user_id = $1 AND revoked = FALSE
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.Exec(ctx, query, userID)
	return err
}

// Revoked checks if the given access or refresh token exists in the database
// and has been revoked. It returns true if the token is revoked, otherwise false.
func (m TokenModel) Revoked(token string) (bool, error) {
	// Create a context with a timeout to avoid hanging queries
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT revoked
		FROM tokens
		WHERE access_token = $1 OR refresh_token = $1
	`

	var revoked bool

	// Execute the query to find if the token exists and check if it's revoked
	err := m.DB.QueryRow(ctx, query, token).Scan(&revoked)
	if err != nil {
		// If no rows found, token doesn't exist
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		// Other DB errors
		return false, err
	}

	// Return true only if token is not revoked
	return revoked, nil
}
