package v1

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// registerAuthRoutes registers the routes related to authentication.
func registerAuthRoutes(rg *gin.RouterGroup, s *APIV1Service) {
	auth := rg.Group("auth")
	auth.POST("login", s.loginHandler)
	auth.POST("refresh", s.refreshTokenHandler)

	auth.Use(s.CheckJWT())
	auth.GET("status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "OK"})
	})
	auth.GET("login-attempts", s.handleLoginAttemptsViewer)

	// this route is only being used to securely manage the posts.
	registerPostRoutes(auth, s)
}

func (s *APIV1Service) loginHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := s.db.Users.GetByEmail(input.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userAttempts, err := s.db.Users.GetLoginAttempt(user.ID, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var (
		currentAttempt int64 = 1
		attemptID      int64
		bannedUntil    time.Time
	)

	// Handle existing attempt record.
	if userAttempts != nil {
		// Check ban state.
		if time.Now().Before(userAttempts.BannedUntil.Time) {
			timeRemaining := time.Until(userAttempts.BannedUntil.Time)
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Too many bad login attempts. Ban expires in " + timeRemaining.String(),
			})
			return
		}
		// Lift temp ban if ban time passed.
		if time.Now().After(userAttempts.BannedUntil.Time) {
			err := s.db.Users.ClearLoginAttemptBan(userAttempts.ID, userAttempts.UserID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		currentAttempt = userAttempts.Attempts + 1
		attemptID = userAttempts.ID
		bannedUntil = userAttempts.BannedUntil.Time

		// If attempts exceed limit, apply ban.
		if currentAttempt > int64(s.config.MaxLoginAttempts) {
			bannedUntil = time.Now().Add(time.Hour * time.Duration(s.config.BanDuration))

			err := s.db.Users.UpdateLoginAttempt(userAttempts.ID, currentAttempt, &bannedUntil)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			ipBanMsg := fmt.Sprintf("This ip address has been banned for %d hours.", s.config.BanDuration)
			c.JSON(http.StatusForbidden, gin.H{"error": ipBanMsg})
			return
		}

		// Always update the attempt count on each request.
		err := s.db.Users.UpdateLoginAttempt(userAttempts.ID, currentAttempt, nil)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

	} else {
		// No record exists, so create one.
		aid, err := s.db.Users.LogAttempt(user.ID, c.ClientIP(), currentAttempt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		attemptID = aid
	}

	match, err := user.Password.Match(input.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !match {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Incorrect password"})
		return
	}

	accessToken, refreshToken, err := generateTokens(user.ID, s)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Successful login, reset all login_attempts restriction.
	err = s.db.Users.ResetAllLoginAttempt(user.ID, attemptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful!",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

func (s *APIV1Service) refreshTokenHandler(c *gin.Context) {
	token, err := getBearerToken(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims, err := parseJWT(token, s.config.JWT.RefSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if the token has a "type" claim and if it's a "refresh" token.
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != TokenTypeRefresh {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrInvalidFormat})
		return
	}

	uid, ok := claims["user_id"].(float64)
	if !ok || uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrUnauthorized})
		return
	}

	accessToken, refreshToken, err := generateTokens(int64(uid), s)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Token has been refreshed!",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

// handleLoginAttemptsViewer handle login attempts data.
func (s *APIV1Service) handleLoginAttemptsViewer(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "25")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil {
		s.logger.Error(err.Error())
		limit = 10
	}

	offset, err := strconv.ParseInt(offsetStr, 10, 64)
	if err != nil {
		s.logger.Error(err.Error())
		offset = 0
	}

	attempts, attemptsCount, err := s.db.Users.GetAllLoginAttempts(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"login_attempts": attempts,
		"total_count":    attemptsCount,
	})
}
