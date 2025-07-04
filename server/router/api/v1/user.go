package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/joybiswas007/blog/internal/database"
)

// registerUserRoutes handles user-specific actions
func registerUserRoutes(rg *gin.RouterGroup, s *APIV1Service) {
	users := rg.Group("users")
	{
		users.POST("reset-password", s.resetPasswdHandler)
	}
}

func (s *APIV1Service) resetPasswdHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required,min=8,max=72"`
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
