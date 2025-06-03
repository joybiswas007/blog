package server

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gosimple/slug"
	"github.com/joybiswas007/blog/internal/database"
)

// registerPostRoutes handles CRUD for posts, protected by auth
func registerPostRoutes(rg *gin.RouterGroup, s *Server) {
	posts := rg.Group("posts")
	posts.Use(s.checkJWT()) // protect all routes here
	posts.GET("", s.postsHandler)
	posts.GET(":id", s.getPostByIDHandler)
	posts.POST("", s.createPostHandler)
	posts.PATCH(":id", s.updatePostHandler)
	posts.DELETE(":id", s.deletePostHandler)
}

func (s *Server) getPosts(c *gin.Context) ([]*database.Post, database.Filter, int, error) {
	// Parse limit and offset query parameters with default values
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	tag := c.Query("tag")
	orderBy := c.DefaultQuery("order_by", "created_at")
	sort := c.DefaultQuery("sort", "DESC")

	isPublishedStr := c.DefaultQuery("is_published", "true")
	isPublished, err := strconv.ParseBool(isPublishedStr)
	if err != nil {
		// fallback or handle invalid value
		isPublished = true
	}

	// Convert limit and offset to integers and validate them
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 5
	}
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Create a filter and fetch posts from the database
	filter := database.Filter{
		Limit:       limit,
		Offset:      offset,
		Tag:         tag,
		OrderBy:     orderBy,
		Sort:        sort,
		IsPublished: isPublished,
	}
	posts, totalPost, err := s.db.Posts.GetAll(filter)
	if err != nil {
		return nil, database.Filter{}, 0, err
	}
	return posts, filter, totalPost, nil
}

func (s *Server) postsHandler(c *gin.Context) {
	posts, _, totalPost, err := s.getPosts(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_post": totalPost,
		"posts":      posts,
	})
}

func (s *Server) getPostByIDHandler(c *gin.Context) {
	// Get the post ID from the request parameter
	id := c.Param("id")
	if id == "" {
		// Respond with a bad request if the ID is missing
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing parameter: id is required to identify the item you want to access."})
		return
	}

	pid, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch the post from the database
	post, err := s.db.Posts.Get(pid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Respond with the fetched post
	c.JSON(http.StatusOK, gin.H{"post": post})
}

func (s *Server) createPostHandler(c *gin.Context) {
	// Parse the post data from the request body
	var post database.Post
	err := c.ShouldBindJSON(&post)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validate := validator.New(validator.WithRequiredStructEnabled())
	if err := validate.Struct(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Process tags: fetch existing or create new ones
	var tagIDs []int
	for _, tagName := range post.Tags {
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

	titleSlug := slug.Make(post.Title)

	post.UserID = int64(uid)
	post.Slug = titleSlug

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

	// Respond with a success message
	c.JSON(http.StatusCreated, gin.H{"message": "Post created successfully!", "post": createdPost})
}

func (s *Server) updatePostHandler(c *gin.Context) {
	// Get the post ID from the request parameter
	postID := c.Param("id")
	if postID == "" {
		// Respond with a bad request if the ID is missing
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing parameter: id is required to update the item you want."})
		return
	}

	// Convert the post ID to an integer
	pid, err := strconv.Atoi(postID)
	if err != nil {
		// Handle invalid ID format
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var post database.Post

	// Parse json response from the body
	err = c.ShouldBindJSON(&post)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	post.ID = pid

	err = s.db.Posts.Update(post)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

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

func (s *Server) deletePostHandler(c *gin.Context) {
	// Get the post ID from the request parameter
	postID := c.Param("id")
	if postID == "" {
		// Respond with a bad request if the ID is missing
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing parameter: id is required to update the item you want."})
		return
	}

	// Convert the post ID to an integer
	pid, err := strconv.Atoi(postID)
	if err != nil {
		// Handle invalid ID format
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = s.db.Posts.Delete(pid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully!"})
}
