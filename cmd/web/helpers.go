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
	"github.com/spf13/viper"
	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

// StripSchema removes the schema from a URL and returns the host and path.
func StripSchema(rawURL string) string {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}

	return parsedURL.Host + parsedURL.Path
}

// MarkdownToHTML converts a Markdown string to HTML with syntax highlighting.
func MarkdownToHTML(content string) string {
	theme := viper.GetString("blog.md_theme")
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
