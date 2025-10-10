// Package frontend handles all frontend routing and static file serving.
package frontend

import (
	"embed"
	"log"
	"net/http"
	"strings"

	"github.com/gin-contrib/static"

	"github.com/gin-gonic/gin"
)

// Embed the entire "dist" directory, which includes index.html and assets.
//
//go:embed "dist"
var embeddedFiles embed.FS

// Serve sets up the frontend routes to serve embedded static files.
func Serve(app *gin.Engine) {
	distFS := getFileSystem("dist")
	app.Use(static.Serve("/", distFS))

	app.NoRoute(func(c *gin.Context) {
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			index, err := distFS.Open("index.html")
			if err != nil {
				log.Fatal(err)
			}
			defer index.Close()
			stat, _ := index.Stat()
			http.ServeContent(c.Writer, c.Request, "index.html", stat.ModTime(), index)
		}
	})
}

func getFileSystem(path string) static.ServeFileSystem {
	fs, err := static.EmbedFolder(embeddedFiles, path)
	if err != nil {
		log.Fatal(err)
	}
	return fs
}
