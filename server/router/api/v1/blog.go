package v1

import (
	"encoding/xml"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	cache "github.com/chenyahui/gin-cache"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/feeds"

	"github.com/joybiswas007/blog/internal/database"
)

// registerBlogRoutes handles posts display.
func registerBlogRoutes(rg *gin.RouterGroup, s *APIV1Service) {
	posts := rg.Group("posts")
	posts.GET("", cache.CacheByRequestURI(s.redisStore, 10*time.Minute), s.blogPostsHandler)
	posts.GET(":slug", cache.CacheByRequestURI(s.redisStore, 30*time.Minute), s.getBlogPostBySlugHandler)
	posts.GET("top-posts", cache.CacheByRequestURI(s.redisStore, 30*time.Minute), s.topPostsHandler)
	posts.GET("tags", cache.CacheByRequestURI(s.redisStore, 30*time.Minute), s.blogTagsHandler)

	archives := posts.Group("archives")
	archives.GET("", cache.CacheByRequestURI(s.redisStore, 1*time.Hour), s.archivesHandler)
	archives.GET(":year", cache.CacheByRequestURI(s.redisStore, 1*time.Hour), s.archiveYearHandler)
}

// blogPostsHandler display posts.
func (s *APIV1Service) blogPostsHandler(c *gin.Context) {
	posts, _, totalPost, err := getPosts(c, s)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// To prevent any potential misuse, we filter out unpublished posts here and ignore them.
	var filteredPosts []*database.Post
	for _, post := range posts {
		// ignore un-published posts
		if !post.IsPublished {
			continue
		}
		filteredPosts = append(filteredPosts, post)
	}

	c.JSON(http.StatusOK, gin.H{"total_post": totalPost, "posts": filteredPosts})
}

func (s *APIV1Service) topPostsHandler(c *gin.Context) {
	topPosts, err := s.db.Posts.GetTop10Posts()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"top_posts": topPosts})
}

func (s *APIV1Service) blogTagsHandler(c *gin.Context) {
	// Fetch all tags from the database
	tags, err := s.db.Tags.GetAll()
	if err != nil {
		// Handle database error
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tags": tags})
}

func (s *APIV1Service) getBlogPostBySlugHandler(c *gin.Context) {
	// Get the post ID from the request parameter
	slug := c.Param("slug")
	if slug == "" {
		// Respond with a bad request if the ID is missing
		c.JSON(http.StatusBadRequest, "Missing parameter: slug is required to identify the item you want to access.")
		return
	}

	// Fetch the post from the database
	post, err := s.db.Posts.GetBySlug(slug)
	if err != nil {
		// Handle database error (e.g., post not found)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var (
		previousPost, nextPost *database.Post
	)

	// Fetch the previous post ID if exists
	previousID, err := s.db.Posts.PreviousID(post.ID)
	if err != nil {
		// Handle database error (e.g., post not found)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch the previous post if ID exists
	if previousID != 0 {
		previousPost, err = s.db.Posts.Get(previousID)
		if err != nil {
			// Handle database error (e.g., post not found)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	// Fetch the next post ID if exists
	nextID, err := s.db.Posts.NextID(post.ID)
	if err != nil {
		// Handle database error (e.g., post not found)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch the next post if ID exists
	if nextID != 0 {
		nextPost, err = s.db.Posts.Get(nextID)
		if err != nil {
			// Handle database error (e.g., post not found)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}
	// Update Post views
	err = s.db.Posts.UpdateViews(post.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": post, "previous_post": previousPost, "next_post": nextPost})
}

func (s *APIV1Service) rssHandler(c *gin.Context) {
	filter := database.Filter{
		Limit:       100,
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
		Title:   s.config.Blog.Name,
		Created: time.Now(),
		Link:    &feeds.Link{Href: s.config.Blog.URL},
	}

	var items []*feeds.Item
	for _, post := range posts {
		item := &feeds.Item{
			Id:          post.Slug,
			Title:       post.Title,
			Link:        &feeds.Link{Href: fmt.Sprintf("%s/posts/%s", s.config.Blog.URL, post.Slug)},
			Description: MarkdownToHTML(post.Content),
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

	_, err = c.Writer.WriteString(rss)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
}

func (s *APIV1Service) archivesHandler(c *gin.Context) {
	lists, err := s.db.Posts.YearlyStatsList()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"archives": lists})
}

func (s *APIV1Service) archiveYearHandler(c *gin.Context) {
	yearStr := c.Param("year")

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	posts, err := s.db.Posts.GetByYear(year)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"archive": gin.H{"year": year, "posts": posts}})
}

func (s *APIV1Service) siteMapHandler(c *gin.Context) {
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
	_, err = c.Writer.WriteString(xml.Header + string(output))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
}
