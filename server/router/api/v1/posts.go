package v1

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
	"github.com/joybiswas007/blog/internal/database"
)

// registerPostRoutes handles CRUD for posts, protected by auth.
func registerPostRoutes(rg *gin.RouterGroup, s *APIV1Service) {
	posts := rg.Group("posts")
	posts.GET("", s.postsHandler)
	posts.GET(":id", s.getPostByIDHandler)
	posts.POST("", s.createPostHandler)
	posts.PATCH(":id", s.updatePostHandler)
	posts.DELETE(":id", s.deletePostHandler)
	posts.POST("publish/:id", s.publishDraftHandler)
}

func (s *APIV1Service) postsHandler(c *gin.Context) {
	posts, _, totalPost, err := getPosts(c, s)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_post": totalPost,
		"posts":      posts,
	})
}

func (s *APIV1Service) getPostByIDHandler(c *gin.Context) {
	pid, err := getIDFromParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := s.db.Posts.Get(pid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Respond with the fetched post
	c.JSON(http.StatusOK, gin.H{"post": post})
}

func (s *APIV1Service) createPostHandler(c *gin.Context) {
	var input struct {
		Title       string   `json:"title" binding:"required,max=255"`
		Description string   `json:"description,omitempty"`
		Content     string   `json:"content" binding:"required"`
		IsPublished bool     `json:"is_published"`
		Tags        []string `json:"tags" binding:"required"`
	}

	// Parse the post data from the request body
	err := c.ShouldBindJSON(&input)
	if err != nil {
		inputValidationErrors(c, err)
		return
	}

	exists, err := s.db.Posts.Exists(slug.Make(input.Title))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A post with this Title already exists. Please choose a unique Title."})
		return
	}

	// Process tags: fetch existing or create new ones
	var tagIDs []int
	for _, tagName := range input.Tags {
		var tagID int
		tag, err := s.db.Tags.Get(tagName)
		if err != nil {
			switch {
			// Create the tag if it doesn't exist
			case errors.Is(err, sql.ErrNoRows):
				tid, err := s.db.Tags.Create(tagName)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				tagID = tid
			default:
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		} else {
			// Use the existing tag ID
			tagID = tag.ID
		}
		tagIDs = append(tagIDs, tagID)
	}

	uid := c.GetFloat64("user_id")
	if uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": ErrNotEnoughPerm})
		return
	}
	post := &database.Post{
		Title:       input.Title,
		Slug:        slug.Make(input.Title),
		UserID:      int64(uid),
		Description: &input.Description,
		Content:     input.Content,
		IsPublished: input.IsPublished,
	}

	// Create the post in the database
	postID, err := s.db.Posts.Create(post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Associate tags with the post
	for _, tagID := range tagIDs {
		err := s.db.Posts.AddTag(postID, tagID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	createdPost, err := s.db.Posts.Get(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// delete cache keys after creating new posts
	deleteCacheKey(s.redisStore)

	// Respond with a success message
	c.JSON(http.StatusCreated, gin.H{"message": "Post created successfully!", "post": createdPost})
}

func (s *APIV1Service) updatePostHandler(c *gin.Context) {
	pid, err := getIDFromParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var post *database.Post

	// Parse json response from the body
	err = c.ShouldBindJSON(&post)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	post.ID = pid

	updatedSlug := slug.Make(post.Title)
	post.Slug = updatedSlug

	err = s.db.Posts.Update(post)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// delete all other cache key
	deleteCacheKey(s.redisStore)

	updatedPost, err := s.db.Posts.Get(pid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Post updated successfully!",
		"post":    updatedPost,
	})
}

func (s *APIV1Service) deletePostHandler(c *gin.Context) {
	pid, err := getIDFromParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = s.db.Posts.Delete(pid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deleteCacheKey(s.redisStore)

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully!"})
}

func (s *APIV1Service) publishDraftHandler(c *gin.Context) {
	pid, err := getIDFromParam(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := s.db.Posts.Get(pid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !post.IsPublished {
		err := s.db.Posts.Publish(post.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// delete cache keys
		deleteCacheKey(s.redisStore)

		c.JSON(http.StatusOK, gin.H{"message": "Post published successfully"})
		return
	}

	// If the post is already published
	c.JSON(http.StatusOK, gin.H{"message": "Post is already published"})
}
