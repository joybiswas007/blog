package v1

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"golang.org/x/time/rate"
)

// CheckJWT validates a JWT token from the "Authorization" header.
// It performs the following checks:
// Ensures the "Authorization" header exists and is in "Bearer <token>" format.
// Verifies the token signature, expiration, and required claims (user_id).
// Cross-checks the token's user_id against the database for validity.
func (s *APIV1Service) CheckJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := getBearerToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		claims, err := parseJWT(token, s.config.JWT.Secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrUnauthorized})
			return
		}

		// Check token type.
		tokenType, ok := claims["type"].(string)
		if !ok || tokenType != TokenTypeAccess {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrInvalidFormat})
			return
		}

		exp, ok := claims["exp"].(float64)
		if !ok || time.Now().Unix() > int64(exp) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrTokenInvalidOrExpired})
			return
		}

		uid, ok := claims["user_id"].(float64)
		if !ok || uid == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrUnauthorized})
			return
		}

		u, err := s.db.Users.GetByID(int64(uid))
		if err != nil || u.ID != int64(uid) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrUnauthorized})
			return
		}

		// track ip changes.
		err = s.updateIPHistory(u.ID, c.ClientIP())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Pass user ID to handlers.
		c.Set("user_id", uid)
		c.Next()
	}
}

// RateLimiter returns a Gin middleware function for rate limiting requests.
// It uses a token bucket algorithm to limit the number of requests allowed per client.
func (s *APIV1Service) RateLimiter() gin.HandlerFunc {
	// Create a new rate limiter that allows 1 request per second with a burst capacity of 10.
	// The burst capacity allows short-term spikes in traffic up to 10 requests.
	limiter := rate.NewLimiter(rate.Limit(s.config.RateLimiter.Rate), s.config.RateLimiter.Burst)

	// Return the middleware function.
	return func(c *gin.Context) {
		// Check if the request can be allowed by the rate limiter.
		// If not allowed, respond with a 429 status code (Too Many Requests).
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "too many requests"}) // Stop further processing of the request.
			return
		}

		// If the request is allowed, proceed to the next handler in the chain.
		c.Next()
	}
}
