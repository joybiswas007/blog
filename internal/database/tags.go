package database

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// TagModel handles database operations for tags
type TagModel struct {
	DB *pgxpool.Pool // Database connection pool
}

// Tag represents a tag in the database
type Tag struct {
	ID        int    `json:"id"`         // Unique identifier for the tag
	Name      string `json:"name"`       // Name of the tag
	PostCount int    `json:"post_count"` // Number of posts associated with this
}

// Get retrieves a tag by its name
func (tag TagModel) Get(tagName string) (*Tag, error) {
	query := `
		SELECT 
			id, 
			name 
		FROM 
			tags 
		WHERE 
			name = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var t Tag
	err := tag.DB.QueryRow(ctx, query, tagName).Scan(&t.ID, &t.Name)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, sql.ErrNoRows
		default:
			return nil, err
		}
	}

	return &t, nil
}

// Create inserts a new tag and returns its ID
func (tag TagModel) Create(tagName string) (int, error) {
	var tagID int

	query := `
		INSERT INTO 
			tags(name) 
		VALUES($1) 
		RETURNING id
	`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := tag.DB.QueryRow(ctx, query, tagName).Scan(&tagID)
	if err != nil {
		return 0, err
	}

	return tagID, nil
}

// GetAll retrieves all tags from the database
func (tag TagModel) GetAll() ([]*Tag, error) {
	query := `
		SELECT 
			t.id, 
			t.name,
			COUNT(bt.blog_id) AS post_count
		FROM 
			tags t
		LEFT JOIN 
			blog_tag bt ON t.id = bt.tag_id
		GROUP BY 
			t.id, t.name
		ORDER BY 
			t.name
	`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := tag.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []*Tag
	for rows.Next() {
		var t Tag
		err := rows.Scan(&t.ID, &t.Name, &t.PostCount)
		if err != nil {
			return nil, err
		}

		tags = append(tags, &t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tags, nil
}

// Delete deletes a tag by its id
func (tag TagModel) Delete(tagID int) error {
	query := `DELETE FROM tags WHERE id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := tag.DB.Exec(ctx, query, tagID)
	if err != nil {
		return err
	}
	return nil
}
