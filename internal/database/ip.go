package database

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type IPModel struct {
	DB *pgxpool.Pool
}

// IPHistory represents a record from the users_history_ips table.
// This table tracks the history of IP addresses used by users.
type IPHistory struct {
	UserID    int64      `json:"user_id"`    // Foreign key reference to users.id
	IP        string     `json:"ip"`         // IP address used by the user (defaults to '0.0.0.0')
	StartTime time.Time  `json:"start_time"` // When the user started using this IP (defaults to NOW())
	EndTime   *time.Time `json:"end_time"`   // When the user stopped using this IP (nullable)
}

// CreateHistory adds a new IP history record.
func (m IPModel) CreateHistory(userID int64, ip string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO users_history_ips (user_id, ip) VALUES ($1, $2)`

	_, err := m.DB.Exec(ctx, query, userID, ip)
	return err
}

// UpdateHistoryEndTime updates the end_time for a specific IP history record.
func (m IPModel) UpdateHistoryEndTime(userID int, ip string, startTime time.Time, endTime time.Time) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE users_history_ips 
		SET end_time = $4
		WHERE user_id = $1 AND ip = $2 AND start_time = $3`

	_, err := m.DB.Exec(ctx, query, userID, ip, startTime, endTime)
	return err
}

// GetActiveSessionByUserID gets the most recent active IP session for a user
func (m IPModel) GetActiveSessionByUserID(userID int64) (*IPHistory, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT user_id, host(ip), start_time, end_time
		FROM users_history_ips
		WHERE user_id = $1 AND end_time IS NULL
		ORDER BY start_time DESC
		LIMIT 1`

	var history IPHistory
	err := m.DB.QueryRow(ctx, query, userID).Scan(
		&history.UserID,
		&history.IP,
		&history.StartTime,
		&history.EndTime,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	return &history, nil
}

// GetAllIPHistory retrieves IP history for a specific user with pagination
func (m IPModel) GetAllIPHistory(userID, limit, offset int64) ([]IPHistory, int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var totalCount int64
	query := `
    		SELECT COUNT(*) OVER() AS total_count, user_id, host(ip), start_time, end_time
    		FROM users_history_ips
    		WHERE user_id = $1
    		ORDER BY start_time DESC
    		LIMIT $2 OFFSET $3`

	rows, err := m.DB.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var histories []IPHistory
	for rows.Next() {
		var h IPHistory
		err := rows.Scan(&totalCount, &h.UserID, &h.IP, &h.StartTime, &h.EndTime)
		if err != nil {
			return nil, 0, err
		}
		histories = append(histories, h)
	}

	return histories, totalCount, rows.Err()
}

// CloseActiveSession closes the most recent active IP session for a user.
func (m IPModel) CloseActiveSession(userID int64, ip string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE users_history_ips 
		SET end_time = NOW()
		WHERE user_id = $1 AND ip = $2 AND end_time IS NULL`

	_, err := m.DB.Exec(ctx, query, userID, ip)
	return err
}
