package v1

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/joybiswas007/blog/internal/database"
	"github.com/joybiswas007/blog/pkg"
)

// registerAuthRoutes registers the routes related to authentication
func registerAuthRoutes(rg *gin.RouterGroup, s *APIV1Service) {
	auth := rg.Group("auth")
	{
		auth.POST("login", s.loginHandler)
		auth.POST("refresh", s.refreshTokenHandler)

		auth.Use(s.CheckJWT())
		auth.GET("status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "OK"})
		})

		ip := auth.Group("ip")
		{
			ip.POST("ban", s.banIPHandler)
			ip.POST("unban/:id", s.unbanIPHandler)
			ip.GET("ban-lists", s.bannedIPLists)
		}

		registerUserRoutes(auth, s)

		//this route is only being used to securely manage the posts
		registerPostRoutes(auth, s)
	}
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

	err = s.handleIPHistoryOnLogin(user.ID, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successfull!",
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

	// Check if the token has a "type" claim and if it's a "refresh" token
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

// handleIPHistoryOnLogin manages IP history when user logs in
func (s *APIV1Service) handleIPHistoryOnLogin(userID int64, currentIP string) error {
	// Get the user's most recent active IP session
	activeSession, err := s.db.Users.IP.GetActiveSessionByUserID(userID)
	if err != nil {
		// If no active session found, create a new one
		if errors.Is(err, database.ErrRecordNotFound) {
			return s.db.Users.IP.CreateHistory(userID, currentIP)
		}
		return err
	}

	// If user is logging in from the same IP as their active session, do nothing
	if activeSession.IP == currentIP {
		return nil
	}

	// User is logging in from a different IP
	// Close the previous session and create a new one
	err = s.db.Users.IP.CloseActiveSession(userID, activeSession.IP)
	if err != nil {
		return err
	}
	// Create new IP history record for the current IP
	return s.db.Users.IP.CreateHistory(userID, currentIP)
}

// banIPHandler ban IPAddresses
func (s *APIV1Service) banIPHandler(c *gin.Context) {
	var input struct {
		FromIP string `json:"from_ip" binding:"required,ip"`
		ToIP   string `json:"to_ip" binding:"required,ip"`
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ban := &database.IPBan{
		FromIP: pkg.IpToInt64(input.FromIP),
		ToIP:   pkg.IpToInt64(input.ToIP),
		Reason: input.Reason,
	}

	err := s.db.Users.IP.Ban(ban)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "IP has been banned!"})
}

func (s *APIV1Service) unbanIPHandler(c *gin.Context) {

}

func (s *APIV1Service) bannedIPLists(c *gin.Context) {
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

	lists, totalCount, err := s.db.Users.IP.GetIPBansList(limit, offset)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "IP Bans List is Empty!"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"lists": lists, "total_count": totalCount})

}
