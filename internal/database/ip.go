package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DefaultBanReason defines the default reason message for IP bans triggered by excessive failed login attempts.
const DefaultBanReason = "Automated ban per >60 failed login attempts"

// IPModel handles database operations for IP address tracking and ban management.
type IPModel struct {
	DB *pgxpool.Pool
}

// IPHistory represents a record from the users_history_ips table.
// This table tracks the history of IP addresses used by users.
type IPHistory struct {
	UserID    int64      `json:"user_id"`    // Foreign key reference to users.id
	IP        string     `json:"ip"`         // IP address used by the user (defaults to '0.0.0.0')
	StartTime time.Time  `json:"start_time"` // When the user started using this IP (defaults to NOW())
	EndTime   *time.Time `json:"end_time"`   // When the user stopped using this IP
}

// IPBan represents a record from the ip_bans table.
// This table stores banned IP ranges with a reason for the ban.
type IPBan struct {
	ID        int64  `json:"id"`      // Unique ban ID
	FromIP    int64  `json:"-"`       // Start of the banned IP range
	ToIP      int64  `json:"-"`       // End of the banned IP range
	FromIPStr string `json:"from_ip"` // Readable 1.2.3.4
	ToIPStr   string `json:"to_ip"`   // Readable 1.2.3.255
	Reason    string `json:"reason"`  // Reason for the ban
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
func (m IPModel) UpdateHistoryEndTime(userID int, ip string, startTime, endTime time.Time) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE users_history_ips 
		SET end_time = $4
		WHERE user_id = $1 AND ip = $2 AND start_time = $3`

	_, err := m.DB.Exec(ctx, query, userID, ip, startTime, endTime)
	return err
}

// GetActiveSessionByUserID gets the most recent active IP session for a user.
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

// GetAllHistory retrieves IP history for a specific user with pagination.
func (m IPModel) GetAllHistory(userID, limit, offset int64) ([]IPHistory, int64, error) {
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

// Ban inserts a new IP ban record into the ip_bans table using the provided IPBan struct.
// It sets the FromIP, ToIP, and Reason fields from the struct.
func (m IPModel) Ban(ban *IPBan) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		INSERT INTO ip_bans (from_ip, to_ip, reason)
		VALUES ($1, $2, $3)`

	args := []any{ban.FromIP, ban.ToIP, ban.Reason}

	result, err := m.DB.Exec(ctx, query, args...)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return nil
	}

	return nil
}

// IsBanned checks if a given IP address is banned by verifying if it falls within any banned range in the ip_bans table.
// Returns true if banned, along with the matching IPBan record (if found) and any error.
func (m IPModel) IsBanned(ip int64) (bool, *IPBan, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Query to check if the IP falls within any banned range
	query := `
		SELECT id, from_ip, to_ip, reason
		FROM ip_bans
		WHERE $1 BETWEEN from_ip AND to_ip`

	var ban IPBan
	err := m.DB.QueryRow(ctx, query, ip).Scan(&ban.ID, &ban.FromIP, &ban.ToIP, &ban.Reason)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil, nil // Not banned
		}
		return false, nil, err
	}

	return true, &ban, nil
}

// GetBansList retrieves a paginated list of IP bans from the database.
// It returns an ordered slice of IPBan records with proper error handling.
func (m IPModel) GetBansList(limit, offset int64) ([]IPBan, int64, error) {
	if limit <= 0 {
		return nil, 0, fmt.Errorf("limit must be greater than 0, got: %d", limit)
	}
	if offset < 0 {
		return nil, 0, fmt.Errorf("offset must be non-negative, got: %d", offset)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var totalCount int64
	query := `SELECT COUNT(*) OVER() AS total_count, 
	                 id, 
	                 host('0.0.0.0'::inet + from_ip) as from_ip,
	                 host('0.0.0.0'::inet + to_ip) as to_ip,
	                 reason
	          FROM ip_bans 
	          ORDER BY id 
	          LIMIT $1 OFFSET $2`

	rows, err := m.DB.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to execute ip_bans query: %w", err)
	}
	defer rows.Close()

	// Pre-allocate slice with expected capacity to reduce memory allocations
	ipBans := make([]IPBan, 0, limit)

	// Iterate through result set and populate IPBan structs
	for rows.Next() {
		var ban IPBan

		if err := rows.Scan(&totalCount, &ban.ID, &ban.FromIPStr, &ban.ToIPStr, &ban.Reason); err != nil {
			return nil, 0, fmt.Errorf("failed to scan ip_ban row: %w", err)
		}

		ipBans = append(ipBans, ban)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error during rows iteration: %w", err)
	}

	return ipBans, totalCount, nil
}

// Unban removes an ip from the ban lists.
func (m IPModel) Unban(banID int64) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `DELETE FROM ip_bans WHERE id = $1`

	_, err := m.DB.Exec(ctx, query, banID)
	if err != nil {
		return err
	}

	return nil
}
