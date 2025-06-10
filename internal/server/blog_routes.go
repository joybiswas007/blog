package server

import (
	"encoding/xml"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/feeds"
	"github.com/joybiswas007/blog/cmd/web"
	template "github.com/joybiswas007/blog/cmd/web/templates"
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
		r := NewRenderer(c.Request.Context(), http.StatusOK, template.About(s.config.Blog))
		c.Render(http.StatusOK, r)
	})
	r.GET("robots.txt", func(c *gin.Context) {
		siteMapURL := fmt.Sprintf("%s/sitemap.xml", s.config.Blog.URL)
		robotsContent := []byte("User-agent: *\nAllow: /\nSitemap: " + siteMapURL)
		_, err := c.Writer.Write(robotsContent)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
	})
	r.GET("rss.xml", s.rssHandler)
	r.GET("sitemap.xml", s.siteMapHandler)

	r.NoRoute(func(c *gin.Context) {
		r := NewRenderer(c.Request.Context(), http.StatusNotFound, template.NotFound(s.config.Blog))
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

	// To prevent any potential misuse, we filter out unpublished posts here and ignore them.
	var filteredPosts []*database.Post
	for _, post := range posts {
		//ignore un-published posts
		if !post.IsPublished {
			continue
		}
		filteredPosts = append(filteredPosts, post)
	}

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Home(s.config.Blog, filteredPosts, totalPost, filter))
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

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Tags(s.config.Blog, tags))
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
	var (
		previousPost, nextPost *database.Post
	)

	// Fetch the previous post ID if exists
	previousID, err := s.db.Posts.PreviousID(post.ID)
	if err != nil {
		// Handle database error (e.g., post not found)
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	// Fetch the previous post if ID exists
	if previousID != 0 {
		previousPost, err = s.db.Posts.Get(previousID)
		if err != nil {
			// Handle database error (e.g., post not found)
			c.String(http.StatusBadRequest, err.Error())
			return
		}
	}

	// Fetch the next post ID if exists
	nextID, err := s.db.Posts.NextID(post.ID)
	if err != nil {
		// Handle database error (e.g., post not found)
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	// Fetch the next post if ID exists
	if nextID != 0 {
		nextPost, err = s.db.Posts.Get(nextID)
		if err != nil {
			// Handle database error (e.g., post not found)
			c.String(http.StatusBadRequest, err.Error())
			return
		}
	}

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Post(s.config.Blog, post, previousPost, nextPost))
	c.Render(http.StatusOK, r)
}

func (s *Server) rssHandler(c *gin.Context) {
	filter := database.Filter{
		Limit:       10,
		Offset:      0,
		OrderBy:     "created_at",
		Sort:        "DESC",
		IsPublished: true,
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
			Description: web.MarkdownToHTML(s.config.Blog.MarkdownTheme, post.Content),
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

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.Archives(s.config.Blog, lists))
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

	r := NewRenderer(c.Request.Context(), http.StatusOK, template.ArchiveByYear(s.config.Blog, year, posts))
	c.Render(http.StatusOK, r)
}

func (s *Server) siteMapHandler(c *gin.Context) {
	type URL struct {
		Loc        string `xml:"loc"`
		LastMod    string `xml:"lastmod,omitempty"`
		ChangeFreq string `xml:"changefreq,omitempty"`
		Priority   string `xml:"priority,omitempty"`
	}
	type URLSet struct {
		XMLName xml.Name `xml:"urlset"`
		Xmlns   string   `xml:"xmlns,attr"`
		Urls    []URL    `xml:"url"`
	}

	const batchSize = 500
	offset := 0
	var allPosts []*database.Post

	for {
		filter := database.Filter{
			Limit:       batchSize,
			Offset:      offset,
			OrderBy:     "created_at",
			Sort:        "ASC",
			IsPublished: true,
		}

		posts, _, err := s.db.Posts.GetAll(filter)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}

		if len(posts) == 0 {
			break
		}

		allPosts = append(allPosts, posts...)
		offset += batchSize
	}

	tags, err := s.db.Tags.GetAll()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	siteURL := s.config.Blog.URL
	var urls []URL
	now := time.Now().Format(time.RFC3339)

	// Add static/manual URLs
	staticPages := []struct {
		Path string
	}{
		{"/"},
		{"/archives"},
		{"/tags"},
		{"/about"},
		{"?limit=10&offset=0&order_by=created_at&sort=DESC"},
		{"?limit=10&offset=0&order_by=created_at&sort=ASC"},
		{"?limit=10&offset=0&order_by=title&sort=ASC"},
	}

	for _, page := range staticPages {
		urls = append(urls, URL{
			Loc:     fmt.Sprintf("%s%s", siteURL, page.Path),
			LastMod: now,
		})
	}

	// Add post URLs
	for _, post := range allPosts {
		postURL := fmt.Sprintf("%s/posts/%s", siteURL, post.Slug)
		urls = append(urls, URL{
			Loc:     postURL,
			LastMod: post.UpdatedAt.Format(time.RFC3339),
		})
	}

	// Add tag URLs
	for _, tag := range tags {
		tagURL := fmt.Sprintf("%s/tags?=%s", siteURL, url.QueryEscape(tag.Name))
		urls = append(urls, URL{
			Loc:     tagURL,
			LastMod: now,
		})
	}

	// Add archive by year URLs
	lists, err := s.db.Posts.YearlyStatsList()
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	for _, list := range lists {
		archiveYear := fmt.Sprintf("%s/archives/%d", siteURL, list.Year)
		urls = append(urls, URL{
			Loc:     archiveYear,
			LastMod: now,
		})
	}

	urlset := URLSet{
		Xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
		Urls:  urls,
	}

	output, err := xml.MarshalIndent(urlset, "", "  ")
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	c.Writer.Header().Set("Content-Type", "application/xml")
	_, err = c.Writer.Write([]byte(xml.Header + string(output)))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
}
