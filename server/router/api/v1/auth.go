package v1

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

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
		auth.GET("sessions", s.sessionsHandler)
		auth.GET("attempts", s.handleLoginAttemptsViewer)

		auth.POST("reset-password", s.resetPasswdHandler)

		ip := auth.Group("ip")
		{
			ip.POST("ban", s.banIPHandler)
			ip.POST("unban/:id", s.unbanIPHandler)
			ip.GET("bans-list", s.bannedIPLists)
		}

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

	userAttempts, err := s.db.Users.GetLoginAttempt(user.ID, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var (
		currentAttempt, currentBans int64 = 1, 1
	)

	if userAttempts != nil {
		// check if ban time is still in effect
		if time.Now().Before(userAttempts.BannedUntil.Time) {
			timeRemaining := time.Until(userAttempts.BannedUntil.Time)
			c.JSON(http.StatusForbidden, gin.H{"error": fmt.Sprintf("Time remaining: %s", timeRemaining.String())})
			return
		}
		// if ban time passed we lift the temp ban
		if time.Now().After(userAttempts.BannedUntil.Time) {
			err := s.db.Users.ClearLoginAttemptBan(userAttempts.ID, userAttempts.UserID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		currentAttempt = userAttempts.Attempts + 1
		currentBans = userAttempts.Bans + 1
	}

	// Check if user login attempts exceeds user defined limit
	//  if yes then ban the ip for defined hours
	if userAttempts != nil && userAttempts.Attempts > int64(s.config.MaxLoginAttempts)-1 {
		bannedUntil := time.Now().Add(time.Hour * time.Duration(s.config.BanDuration))

		err := s.db.Users.UpdateLoginAttempt(userAttempts.ID, currentAttempt, bannedUntil, currentBans)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Automated bruteforce prevention
		if userAttempts.Bans > 9 {
			ipInt := pkg.IpToInt64(c.ClientIP())

			isBanned, banDetails, err := s.db.Users.IP.IsBanned(ipInt)
			if err != nil {
				c.JSON(http.StatusForbidden, gin.H{"error": banDetails.Reason})
				return
			}
			switch isBanned {
			case true:
				c.JSON(http.StatusForbidden, gin.H{"error": banDetails.Reason})
			case false:
				ipBan := &database.IPBan{
					FromIP: ipInt,
					ToIP:   ipInt,
					Reason: database.DEFAULT_BAN_RESON,
				}
				err = s.db.Users.IP.Ban(ipBan)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})

					return
				}
				c.JSON(http.StatusForbidden, gin.H{"error": "This ip adddress has been banned."})
			}
			return
		}

		ipBanMsg := fmt.Sprintf("This ip address has been banned for %d hours.", s.config.BanDuration)
		c.JSON(http.StatusForbidden, gin.H{"error": ipBanMsg})
		return
	}

	attemptID, err := s.db.Users.LogAttempt(user.ID, c.ClientIP(), currentAttempt, currentBans)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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

	//successful login reset all login_attempts restriction
	err = s.db.Users.ResetAllLoginAttempt(user.ID, attemptID)
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

// sessionsHandler fetches users serssions
func (s *APIV1Service) sessionsHandler(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	uid := c.GetFloat64("user_id")
	if uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrNotEnoughPerm})
		return
	}

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

	iphistory, totalCount, err := s.db.Users.IP.GetAllHistory(int64(uid), limit, offset)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusBadRequest, gin.H{"error": database.ErrRecordNotFound})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sessions": gin.H{
			"history":     iphistory,
			"total_count": totalCount,
		}})
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

// unbanIPHandler removes ip from the bans list
func (s *APIV1Service) unbanIPHandler(c *gin.Context) {
	banID, err := getIDFromParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = s.db.Users.IP.Unban(int64(banID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "IP has been unbanned!"})
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

	lists, totalCount, err := s.db.Users.IP.GetBansList(limit, offset)
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

// resetPasswdHandler reset password
func (s *APIV1Service) resetPasswdHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8,max=72"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	uid := c.GetFloat64("user_id")
	if uid == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrNotEnoughPerm})
		return
	}

	user, err := s.db.Users.GetByEmail(input.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if user.ID != int64(uid) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrUnauthorized})
		return
	}

	updateUser := &database.User{
		ID: user.ID,
	}

	err = updateUser.Password.Set(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := s.db.Users.UpdatePassword(updateUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully!"})
}

// handleLoginAttemptsViewer handle login attempts data
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
