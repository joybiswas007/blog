package server

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/feeds"
	"github.com/joybiswas007/blog/cmd/web"
	"github.com/joybiswas007/blog/cmd/web/templates"
	"github.com/joybiswas007/blog/internal/database"
)

// registerBlogRoutes handles posts display
func registerBlogRoutes(r *gin.Engine, s *Server) {
	r.GET("", s.blogPostsHandler)
	r.GET("posts/:slug", s.getBlogPostBySlugHandler)
	r.GET("tags", s.blogTagsHandler)

	archives := r.Group("archives")
	archives.GET("", s.archivesHandler)
	archives.GET(":year", s.archiveYearHandler)

	r.GET("about", func(c *gin.Context) {
		r := NewRenderer(c.Request.Context(), http.StatusOK, template.About(s.config.Blog.Author))
		c.Render(http.StatusOK, r)
	})
	r.GET("robots.txt", func(c *gin.Context) {
		robotsContent := []byte("User-agent: *\nAllow: /")
		c.Writer.Write(robotsContent)
	})
	r.GET("rss.xml", s.rssHandler)

	r.NoRoute(func(c *gin.Context) {
		r := NewRenderer(c.Request.Context(), http.StatusNotFound, template.NotFound())
		c.Render(http.StatusNotFound, r)
	})
}

// blogPostsHandler display posts
func (s *Server) blogPostsHandler(c *gin.Context) {
	posts, filter, totalPost, err := s.getPosts(c)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Home(posts, totalPost, filter))
	c.Render(http.StatusOK, r)
}

func (s *Server) blogTagsHandler(c *gin.Context) {
	// Fetch all tags from the database
	tags, err := s.db.Tags.GetAll()
	if err != nil {
		// Handle database error
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Tags(tags))
	c.Render(http.StatusOK, r)
}

func (s *Server) getBlogPostBySlugHandler(c *gin.Context) {
	// Get the post ID from the request parameter
	slug := c.Param("slug")
	if slug == "" {
		// Respond with a bad request if the ID is missing
		c.String(http.StatusBadRequest, "Missing parameter: slug is required to identify the item you want to access.")
		return
	}

	// Fetch the post from the database
	post, err := s.db.Posts.GetBySlug(slug)
	if err != nil {
		// Handle database error (e.g., post not found)
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Post(post))
	c.Render(http.StatusOK, r)
}

func (s *Server) rssHandler(c *gin.Context) {
	filter := database.Filter{
		Limit:   10,
		Offset:  0,
		OrderBy: "created_at",
		Sort:    "DESC",
	}

	posts, _, err := s.db.Posts.GetAll(filter)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	feed := &feeds.Feed{
		Title:       s.config.Blog.Name,
		Description: s.config.Blog.Description,
		Author:      &feeds.Author{Name: s.config.Blog.Author.Name},
		Created:     time.Now(),
		Link:        &feeds.Link{Href: s.config.Blog.URL},
	}

	var items []*feeds.Item
	for _, post := range posts {
		item := &feeds.Item{
			Id:          post.Slug,
			Title:       post.Title,
			Link:        &feeds.Link{Href: fmt.Sprintf("%s/posts/%s", s.config.Blog.URL, post.Slug)},
			Description: web.MarkdownToHTML(post.Content),
			Created:     post.CreatedAt,
		}
		items = append(items, item)
	}

	feed.Items = items
	rss, err := feed.ToRss()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.Writer.Header().Add("Content-Type", "application/xml")

	_, err = c.Writer.Write([]byte(rss))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
}

func (s *Server) archivesHandler(c *gin.Context) {
	lists, err := s.db.Posts.YearlyStatsList()
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Archives(lists))
	c.Render(http.StatusOK, r)
}

func (s *Server) archiveYearHandler(c *gin.Context) {
	yearStr := c.Param("year")

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	posts, err := s.db.Posts.GetByYear(year)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.ArchiveByYear(year, posts))
	c.Render(http.StatusOK, r)
}
