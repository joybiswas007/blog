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
	chromahtml "github.com/alecthomas/chroma/v2/formatters/html"
	"github.com/spf13/viper"
	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

func StripSchema(rawURL string) string {
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}

	return parsedURL.Host + parsedURL.Path
}

// Helper to convert markdown to HTML
func MarkdownToHTML(content string) string {
	theme := viper.GetString("blog.md_theme")
	if theme == "" {
		theme = "vim"
	}
	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			highlighting.NewHighlighting(
				highlighting.WithStyle(theme),
				highlighting.WithFormatOptions(
					chromahtml.WithLineNumbers(true),
				),
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
	_ = md.Convert([]byte(content), &buf)
	return buf.String()
}

func Unsafe(html string) templ.Component {
	return templ.ComponentFunc(func(ctx context.Context, w io.Writer) (err error) {
		_, err = io.WriteString(w, html)
		return
	})
}

func CalculateReadTime(text string) string {
	if len(strings.TrimSpace(text)) == 0 {
		return "0 min read"
	}
	words := len(strings.Fields(text))
	minutes := int(math.Ceil(float64(words) / 200.0))
	return fmt.Sprintf("%d min read", minutes)
}
