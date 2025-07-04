package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// registerAuthRoutes registers the routes related to authentication
func registerAuthRoutes(rg *gin.RouterGroup, s *APIV1Service) {
	auth := rg.Group("auth")
	{
		auth.POST("login", s.loginHandler)
		auth.POST("refresh", s.refreshTokenHandler)

		auth.Use(s.checkJWT())
		auth.GET("status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "OK"})
		})

		registerUserRoutes(auth, s)

		//this route is only being used to securely manage the posts
		registerPostRoutes(auth, s)
	}
}

func (s *APIV1Service) loginHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validate := validator.New(validator.WithRequiredStructEnabled())

	if err := validate.Struct(&input); err != nil {
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

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successfull!",
		"user":          user,
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
