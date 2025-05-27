package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joybiswas007/blog/internal/database"
)

// registerAuthRoutes registers the routes related to authentication
func registerAuthRoutes(rg *gin.RouterGroup, s *Server) {
	auth := rg.Group("auth")
	auth.POST("login", s.loginHandler)
	auth.POST("refresh", s.refreshTokenHandler)

	auth.Use(s.checkJWT())
	auth.GET("status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "OK"})
	})
	auth.POST("logout", s.logoutHandler)

	registerUserRoutes(auth, s)
}

func (s *Server) registerHandler(c *gin.Context) {
	// Create an anonymous struct to hold the expected data from the request body.
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := c.ShouldBindJSON(&input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := &database.User{
		Name:  input.Name,
		Email: input.Email,
	}

	err = user.Password.Set(input.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := s.db.Users.Insert(user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	u, err := s.db.Users.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully!",
		"user":    u,
	})
}

func (s *Server) loginHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
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

	accessToken, refreshToken, err := generateAndStoreTokens(user.ID, s)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successfull!",
		"user":          user,
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

func (s *Server) refreshTokenHandler(c *gin.Context) {
	token, err := getBearerToken(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//check if token is already revoked or not
	revoked, err := s.db.Tokens.Revoked(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrUnauthorized})
		return
	}

	// if revoked then ignore the request
	if revoked {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrTokenExpired})
		return
	}

	claims, err := parseJWT(token, s.config.JWT.Secret)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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

	//before generating new token revoke user previous tokens
	err = s.db.Tokens.Logout(int64(uid))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	accessToken, refreshToken, err := generateAndStoreTokens(int64(uid), s)
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

func (s *Server) logoutHandler(c *gin.Context) {
	uid := c.GetFloat64("user_id")
	if uid == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": ErrNotEnoughPerm})
		return
	}

	err := s.db.Tokens.Logout(int64(uid))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logout successfull!"})
}
