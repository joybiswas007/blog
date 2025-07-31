package v1

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log"
	"maps"
	"strconv"
	"strings"
	"time"

	"github.com/chenyahui/gin-cache/persist"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"

	"github.com/joybiswas007/blog/internal/database"
)

const (
	TokenTypeAccess  = "access"
	TokenTypeRefresh = "refresh"
)

var (
	ErrUnauthorized          = "Unauthorized access"
	ErrTokenInvalidOrExpired = "Your session has expired"
	ErrMissingHeader         = "missing Authorization header"
	ErrInvalidFormat         = "invalid Authorization header"
	ErrEmptyToken            = "token is empty"
	ErrUserNotFound          = "user not found"
	ErrTokenExpired          = "token expired"
	ErrInvalidAuthFormat     = "Invalid Authorization format. Expected 'Bearer <token>'"
	ErrNotEnoughPerm         = "You don't have enough permission to access this resource."
)

// getBearerToken extracts the Bearer token from the Authorization header.
func getBearerToken(c *gin.Context) (string, error) {
	// Get the Authorization header
	auth := c.GetHeader("Authorization")
	if auth == "" {
		return "", errors.New(ErrMissingHeader)
	}

	const prefix = "Bearer "
	// Check if it starts with "Bearer "
	if !strings.HasPrefix(auth, prefix) {
		return "", errors.New(ErrInvalidAuthFormat)
	}

	// Trim the "Bearer " prefix to get the token
	token := strings.TrimPrefix(auth, prefix)
	if token == "" {
		return "", errors.New(ErrEmptyToken)
	}

	return token, nil
}

// generateJWT creates a signed JSON Web Token (JWT) with the provided data as claims.
// The token is signed using the provided secret key and the HS256 (HMAC-SHA256) algorithm.
func generateJWT(data map[string]any, secretKey string) (string, error) {
	// Create a new JWT token using the HS256 (HMAC-SHA256) signing method.
	t := jwt.New(jwt.SigningMethodHS256)

	// Cast the token's claims to a MapClaims type to add custom data.
	claims := t.Claims.(jwt.MapClaims)

	// Add the provided key-value pairs to the token's claims.
	maps.Copy(claims, data)

	// Sign the token using the provided secret key.
	token, err := t.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return token, nil
}

// parseJWT parses a JWT token and validates it, returning the claims if valid.
func parseJWT(tokenString, secretKey string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		// Ensure the signing method is HMAC
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}

		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, err
	}

	return claims, nil
}

// generateTokens generates access and refresh tokens for a user and returns both tokens.
func generateTokens(userID int64, s *APIV1Service) (accessToken, refreshToken string, err error) {
	// Access token config
	accessExp := s.config.JWT.Exp
	accessClaims := map[string]any{
		"user_id": userID,
		"type":    TokenTypeAccess,
		"exp":     time.Now().Add(time.Hour * time.Duration(accessExp)).Unix(),
	}

	accessToken, err = generateJWT(accessClaims, s.config.JWT.Secret)
	if err != nil {
		return "", "", err
	}

	// Refresh token config
	refreshExp := s.config.JWT.RefExp
	refreshClaims := map[string]any{
		"user_id": userID,
		"type":    TokenTypeRefresh,
		"exp":     time.Now().Add(time.Hour * time.Duration(refreshExp)).Unix(),
	}

	refreshToken, err = generateJWT(refreshClaims, s.config.JWT.RefSecret)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

// getIDFromParam extracts the "id" parameter from the request,
// converts it to an integer, and returns an error if it's missing or invalid.
func getIDFromParam(c *gin.Context) (int, error) {
	// Get the ID from the URL parameter
	idStr := c.Param("id")
	if idStr == "" {
		return 0, fmt.Errorf("missing parameter: id is required")
	}

	// Convert the ID to an integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, fmt.Errorf("invalid ID: %w", err)
	}

	return id, nil
}

func getPosts(c *gin.Context, s *APIV1Service) ([]*database.Post, database.Filter, int, error) {
	// Parse limit and offset query parameters with default values
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	tag := c.Query("tag")
	orderBy := c.DefaultQuery("order_by", "created_at")
	sort := c.DefaultQuery("sort", "DESC")

	isPublishedStr := c.DefaultQuery("is_published", "true")
	isPublished, err := strconv.ParseBool(isPublishedStr)
	if err != nil {
		// fallback or handle invalid value
		isPublished = true
	}

	// Convert limit and offset to integers and validate them
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 5
	}
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Create a filter and fetch posts from the database
	filter := database.Filter{
		Limit:       limit,
		Offset:      offset,
		Tag:         tag,
		OrderBy:     orderBy,
		Sort:        sort,
		IsPublished: isPublished,
	}
	posts, totalPost, err := s.db.Posts.GetAll(filter)
	if err != nil {
		return nil, database.Filter{}, 0, err
	}
	return posts, filter, totalPost, nil
}

// MarkdownToHTML converts a Markdown string to HTML with syntax highlighting.
func MarkdownToHTML(content string) string {
	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			highlighting.NewHighlighting(
				highlighting.WithGuessLanguage(true),
				highlighting.WithStyle("nord"),
			),
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			html.WithHardWraps(),
			html.WithXHTML(),
		),
	)
	var buf bytes.Buffer
	if err := md.Convert([]byte(content), &buf); err != nil {
		return fmt.Sprintf("<div class='error'>Error rendering markdown: %v</div>", err)
	}
	return buf.String()
}

// deleteCacheKey invalidates cached data for blog posts, tags, and archives by deleting matching keys from Redis.
func deleteCacheKey(cacheStore *persist.RedisStore) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	patterns := []string{
		"/api/v1/posts*",           // All post lists
		"/api/v1/posts/tags",       // Single tag key
		"/api/v1/posts/archives",   // Single archive key
		"/api/v1/posts/archives/*", // All archive keys
	}

	for _, pattern := range patterns {
		// For pattern keys, use SCAN
		var cursor uint64
		for {
			keys, nextCursor, err := cacheStore.RedisClient.Scan(ctx, cursor, pattern, 100).Result()
			if err != nil {
				log.Printf("Scan error for pattern %s: %v", pattern, err)
				break
			}
			if len(keys) > 0 {
				if err := cacheStore.RedisClient.Del(ctx, keys...).Err(); err != nil {
					log.Printf("Failed to delete keys %v: %v", keys, err)
				}
			}
			cursor = nextCursor
			if cursor == 0 {
				break
			}
		}
	}
}
