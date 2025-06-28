package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PostModel handles database operations for blog posts
type PostModel struct {
	DB *pgxpool.Pool // Database connection pool
}

// Post represents a blog post in the database
type Post struct {
	ID          int       `json:"id"`                          // Unique identifier for the post
	UserID      int64     `json:"-"`                           // UserID of the user who created the post
	Author      string    `json:"author"`                      // Author the guy who posted the blog
	Title       string    `json:"title" validate:"required"`   // Title of the post
	Description *string   `json:"description,omitempty"`       // Short summary of the post
	Content     string    `json:"content" validate:"required"` // Main content of the post
	Slug        string    `json:"slug"`                        // Slug of post title
	IsPublished bool      `json:"is_published"`                // Indicates if the post is published or not
	Tags        []string  `json:"tags" validate:"required"`    // List of tags associated with the post
	CreatedAt   time.Time `json:"created_at"`                  // When the post was created
	UpdatedAt   time.Time `json:"updated_at"`                  // When the post was last updated
}

type YearlyStats struct {
	Year      int `json:"year"`       // Year of the posts
	PostCount int `json:"post_count"` // Number of posts in that year
}

// Get retrieves a single post by its ID including associated tags
func (m PostModel) Get(postID int) (*Post, error) {
	query := `
        SELECT
            bp.id,
	    u.name AS author,
            bp.title,
	    bp.description,
            bp.content,
	    bp.slug,
	    bp.is_published,
            bp.created_at,
            bp.updated_at,
            COALESCE(ARRAY_AGG(t.name), '{}') AS tags
        FROM
            blog_posts bp
	JOIN
    	    users u ON bp.user_id = u.id
        LEFT JOIN
            blog_tag bt ON bp.id = bt.blog_id
        LEFT JOIN
            tags t ON t.id = bt.tag_id
        WHERE
            bp.id = $1
        GROUP BY
            bp.id, u.name;
    `
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var p Post
	err := m.DB.QueryRow(ctx, query, postID).Scan(
		&p.ID,
		&p.Author,
		&p.Title,
		&p.Description,
		&p.Content,
		&p.Slug,
		&p.IsPublished,
		&p.CreatedAt,
		&p.UpdatedAt,
		&p.Tags,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &p, nil
}

// GetBySlug retrieves a single post by its slug including author name and associated tags
func (m PostModel) GetBySlug(slug string) (*Post, error) {
	query := `
        SELECT
            bp.id,
            u.name AS author,
            bp.title,
	    bp.description,
            bp.content,
            bp.slug,
	    bp.is_published,
            bp.created_at,
            bp.updated_at,
            COALESCE(ARRAY_AGG(t.name), '{}') AS tags
        FROM
            blog_posts bp
        JOIN
            users u ON bp.user_id = u.id
        LEFT JOIN
            blog_tag bt ON bp.id = bt.blog_id
        LEFT JOIN
            tags t ON t.id = bt.tag_id
        WHERE
            bp.slug = $1
        GROUP BY
            bp.id, u.name;
    `

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var p Post
	err := m.DB.QueryRow(ctx, query, slug).Scan(
		&p.ID,
		&p.Author,
		&p.Title,
		&p.Description,
		&p.Content,
		&p.Slug,
		&p.IsPublished,
		&p.CreatedAt,
		&p.UpdatedAt,
		&p.Tags,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &p, nil
}

// Create inserts a new blog post and returns its ID
func (m PostModel) Create(p Post) (int, error) {
	var postID int
	query := `INSERT INTO blog_posts(user_id, title, description, content, slug, is_published) 
		  VALUES($1, $2, $3, $4, $5, $6) 
		  RETURNING id`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRow(ctx, query, p.UserID, p.Title, p.Description, p.Content, p.Slug, p.IsPublished).Scan(&postID)
	if err != nil {
		return 0, err
	}

	return postID, nil
}

// AddTag associates a tag with a blog post
func (m PostModel) AddTag(postID, tagID int) error {
	query := `INSERT INTO blog_tag(blog_id, tag_id) VALUES($1, $2)`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []any{postID, tagID}

	_, err := m.DB.Exec(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}

// Update updates the specific post
func (m PostModel) Update(p Post) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// First verify the post exists
	var exists bool
	err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM blog_posts WHERE id = $1)`, p.ID).Scan(&exists)
	if err != nil {
		return err
	}

	if !exists {
		return ErrRecordNotFound
	}

	// update the blog post
	updateQuery := `
            UPDATE blog_posts 
            SET title = $1, description = $2, content = $3, slug = $4
            WHERE id = $5`

	updateArgs := []any{
		p.Title,
		p.Description,
		p.Content,
		p.Slug,
		p.ID, // id we are passing to identify the post
	}
	_, err = tx.Exec(ctx, updateQuery, updateArgs...)
	if err != nil {
		return err
	}

	if p.Tags != nil {
		// Delete existing tag mappings
		_, err = tx.Exec(ctx, `DELETE FROM blog_tag WHERE blog_id = $1`, p.ID)
		if err != nil {
			switch {
			case errors.Is(err, sql.ErrNoRows):
				return ErrEditConflict
			default:
				return err
			}
		}

		// Loop through tags
		for _, tag := range p.Tags {
			var tagID int

			// Check if tag exists
			err := tx.QueryRow(ctx, `SELECT id FROM tags WHERE name = $1`, tag).Scan(&tagID)
			if err != nil {
				switch {
				case errors.Is(err, sql.ErrNoRows):
					// Create tag if it doesn't exist
					err = tx.QueryRow(ctx, `INSERT INTO tags(name) VALUES($1) RETURNING id`, tag).Scan(&tagID)
					if err != nil {
						return err
					}
				default:
					return err
				}
			}

			// Insert into blog_tag
			_, err = tx.Exec(ctx, `INSERT INTO blog_tag(blog_id, tag_id) VALUES($1, $2)`, p.ID, tagID)
			if err != nil {
				return err
			}

		}
	}
	// Commit transaction
	return tx.Commit(ctx)
}

// Publish sets the `is_published` field of a post to true, marking it as published.
// Returns an error if the post doesn't exist or the update fails.
func (m PostModel) Publish(postID int) error {
	query := `UPDATE blog_posts 
          SET is_published = true,
		created_at = NOW()
          WHERE id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.Exec(ctx, query, postID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrEditConflict
		default:
			return err
		}
	}
	return nil
}

// Delete deletes the specific blog post
func (m PostModel) Delete(postID int) error {
	query := `DELETE FROM blog_posts WHERE id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.Exec(ctx, query, postID)
	if err != nil {
		return err
	}

	row := result.RowsAffected()
	if row == 0 {
		return ErrRecordNotFound
	}
	return nil
}

// GetAll retrieves a paginated list of all blog posts with their tags
func (m PostModel) GetAll(filter Filter) ([]*Post, int, error) {
	query := fmt.Sprintf(`
SELECT
    count(*) OVER(),
    bp.id,
    bp.user_id,
    u.name AS author,
    bp.title,
    bp.description,
    bp.content,
    bp.slug,
    bp.is_published,
    bp.created_at,
    bp.updated_at,
    COALESCE(ARRAY_AGG(t.name ORDER BY t.name), '{}') AS tags
FROM
    blog_posts bp
JOIN 
    users u ON bp.user_id = u.id
LEFT JOIN
    blog_tag bt ON bp.id = bt.blog_id
LEFT JOIN
    tags t ON t.id = bt.tag_id
WHERE
    ($3 = '' OR bp.id IN (
        SELECT blog_id
        FROM blog_tag bt2
        JOIN tags t2 ON t2.id = bt2.tag_id
        WHERE t2.name = $3
    ))
    AND bp.is_published = $4
GROUP BY
    bp.id, u.name
ORDER BY
    bp.%s %s, bp.id ASC
LIMIT $1 OFFSET $2;
`, filter.OrderBy, filter.Sort)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, query, filter.Limit, filter.Offset, filter.Tag, filter.IsPublished)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var posts []*Post
	var totalCount int

	for rows.Next() {
		var p Post
		err := rows.Scan(
			&totalCount,
			&p.ID,
			&p.UserID,
			&p.Author,
			&p.Title,
			&p.Description,
			&p.Content,
			&p.Slug,
			&p.IsPublished,
			&p.CreatedAt,
			&p.UpdatedAt,
			&p.Tags,
		)
		if err != nil {
			return nil, 0, err
		}
		posts = append(posts, &p)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return posts, totalCount, nil
}

// YearlyStatsList retrieves a list of years along with the number of posts created in each year.
// It queries the `posts` table, groups by year extracted from the `created_at` column,
// and returns the results in descending year order.
func (m PostModel) YearlyStatsList() ([]YearlyStats, error) {
	query := `
		SELECT EXTRACT(YEAR FROM created_at)::INT AS year, COUNT(*) AS count
		FROM blog_posts
		GROUP BY year
		ORDER BY year DESC;
	`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []YearlyStats

	for rows.Next() {
		var stat YearlyStats
		if err := rows.Scan(&stat.Year, &stat.PostCount); err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return stats, nil
}

// GetByYear returns all blog posts created in the given year.
// It filters the posts using the `created_at` timestamp column.
func (m PostModel) GetByYear(year int) ([]Post, error) {
	query := `
	SELECT id, title, slug, created_at
	FROM blog_posts
	WHERE EXTRACT(YEAR FROM created_at)::INT = $1
	  AND is_published = true
	ORDER BY created_at DESC;
`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, query, year)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []Post

	for rows.Next() {
		var p Post
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.CreatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

// PreviousID returns the ID of the most recent published post with an ID less than currentID.
// If no such post exists, it returns 0 and nil error.
func (m PostModel) PreviousID(currentID int) (int, error) {
	const query = `
		SELECT id 
		FROM blog_posts
		WHERE id < $1 AND is_published = true
		ORDER BY id DESC
		LIMIT 1;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var postID int

	err := m.DB.QueryRow(ctx, query, currentID).Scan(&postID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return 0, nil // No previous post found
		default:
			return 0, err // Other error
		}
	}
	return postID, nil
}

// NextID returns the ID of the next published post with an ID greater than currentID.
// If no such post exists, it returns 0 and nil error.
func (m PostModel) NextID(currentID int) (int, error) {
	const query = `
		SELECT id 
		FROM blog_posts
		WHERE id > $1 AND is_published = true
		ORDER BY id ASC
		LIMIT 1;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var postID int

	err := m.DB.QueryRow(ctx, query, currentID).Scan(&postID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return 0, nil // No next post found
		default:
			return 0, err // Other error
		}
	}
	return postID, nil
}
