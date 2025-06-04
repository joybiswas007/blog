package server

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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
func generateJWT(data map[string]interface{}, secretKey string) (string, error) {
	// Create a new JWT token using the HS256 (HMAC-SHA256) signing method.
	t := jwt.New(jwt.SigningMethodHS256)

	// Cast the token's claims to a MapClaims type to add custom data.
	claims := t.Claims.(jwt.MapClaims)

	// Add the provided key-value pairs to the token's claims.
	for key, value := range data {
		claims[key] = value
	}

	// Sign the token using the provided secret key.
	token, err := t.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return token, nil
}

// parseJWT parses a JWT token and validates it, returning the claims if valid.
func parseJWT(tokenString, secretKey string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
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
func generateTokens(userID int64, s *Server) (accessToken, refreshToken string, err error) {
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
