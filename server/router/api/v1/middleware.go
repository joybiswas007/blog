package v1

import (
	"net/http"

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

		if claims.Type != TokenTypeAccess {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]any{"error": "invalid authorization token"})
			return
		}

		u, err := s.db.Users.GetByID(c.Request.Context(), claims.UserID)
		if err != nil || u.ID != claims.UserID {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": ErrUnauthorized})
			return
		}

		// Pass user ID to handlers.
		c.Set("user_id", claims.UserID)
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
