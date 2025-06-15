package web

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"math"
	"net/url"
	"strings"

	"github.com/a-h/templ"
	"github.com/joybiswas007/blog/config"
	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

// SEO holds metadata for search engines and social sharing.
type SEO struct {
	Title       string    // The page or post title (shown in browser tab and search results)
	Description string    // A brief summary of the page/post (used in meta description)
	Keywords    []string  // List of keywords relevant to the page/post (meta keywords)
	Author      string    // Name of the content author
	SiteName    string    // The name of your website or blog
	Canonical   string    // Canonical URL for the page (prevents duplicate content issues)
	OG          OpenGraph // Contains Open Graph metadata used to control how this page appears when shared on social media platforms
	GTagID      string    // Google Analytics Measurement ID (for tracking site usage)
	SourceCode  string    // URL or reference to the source code repository for this page/post
}

// OpenGraph holds metadata for social media sharing using the Open Graph protocol.
type OpenGraph struct {
	Type  string // The type of content: e.g., "website" or "article"
	Image string // The URL of the image to display in social shares
}

// NewSEO creates and returns an SEO struct with default values
// populated from the provided blog configuration.
func NewSEO(blog config.Blog) SEO {
	return SEO{
		// Title:       blog.Name, // "Home", "About", "Tags"
		Description: blog.Description,
		Keywords:    blog.Keywords,
		Author:      blog.Author.Name,
		Canonical:   blog.URL,
		SiteName:    blog.Name,
		OG: OpenGraph{
			Type: "website",
		},
		GTagID:     blog.GTagID,
		SourceCode: blog.Source,
	}
}

// StripSchema removes the schema from a URL and returns the host and path.
func StripSchema(rawURL string) string {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}

	return parsedURL.Host + parsedURL.Path
}

// MarkdownToHTML converts a Markdown string to HTML with syntax highlighting.
func MarkdownToHTML(theme, content string) string {
	if theme == "" {
		theme = "nord"
	}
	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			highlighting.NewHighlighting(
				highlighting.WithGuessLanguage(true),
				highlighting.WithStyle(theme),
			),
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			html.WithHardWraps(),
			html.WithXHTML(),
		),
	)
	var buf bytes.Buffer
	if err := md.Convert([]byte(content), &buf); err != nil {
		return fmt.Sprintf("<div class='error'>Error rendering markdown: %v</div>", err)
	}
	return buf.String()
}

// Unsafe wraps a raw HTML string as a templ.Component for rendering.
func Unsafe(html string) templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, w io.Writer) (err error) {
		_, err = io.WriteString(w, html)
		return
	})
}

// CalculateReadTime returns an estimated read time for a text string.
func CalculateReadTime(text string) string {
	if len(strings.TrimSpace(text)) == 0 {
		return "0 min read"
	}
	words := len(strings.Fields(text))
	minutes := int(math.Ceil(float64(words) / 200.0))
	return fmt.Sprintf("%d min read", minutes)
}
