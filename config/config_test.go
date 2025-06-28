package config

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/spf13/viper"
)

func resetViper() {
	viper.Reset()
}

func writeTempConfig(t *testing.T, content string) string {
	t.Helper()
	dir := t.TempDir()

	configPath := filepath.Join(dir, ".blog.yaml")
	if err := os.WriteFile(configPath, []byte(content), 0644); err != nil {
		t.Fatalf("failed to write temp config: %v", err)
	}

	return configPath
}

func TestInitWithConfigFile(t *testing.T) {
	resetViper()

	cfgContent := `
port: 8080
db: postgres://username:password@localhost:port/dbName?sslmode=disable
jwt:
  secret: "Super_Sekret_JWT_Key"
  exp: 2
  ref_exp: 24
  ref_secret: "Super_Sekret_Refresh_JWT_Key"
rate_limiter:
  rate: 1
  burst: 25
is_production: true
blog:
  name: "A name for your blog"
  description: "Enter your blog description"
  source: https://github.com/joybiswas007/blog
  url: "https://sitename.com"
  gtag_id: "G-XXXXXXX"
  md_theme: nord
  keywords:
    - keyword1
    - keyword2
    - keyword3
  author:
    name: "Your Name"
    profession: "Your Profession Here"
    social:
      github: https://github.com/username
      twitter: https://x.com/username
      linkedIn: https://linkedin.com/in/username/
      email: example@mail.com
      fiverr: https://fiverr.com/username
      upwork: https://upwork.com/freelancers/username
`
	configPath := writeTempConfig(t, cfgContent)
	Init(configPath)

	cfg, err := GetAll()
	if err != nil {
		t.Fatalf("GetAll failed: %v", err)
	}

	if cfg.Port != 8080 || !cfg.IsProduction {
		t.Errorf("unexpected config: %+v", cfg)
	}
}

func TestGetAll(t *testing.T) {
	resetViper()
	Init("")

	_, err := GetAll()
	if err == nil {
		t.Fatal("expected validation error, got nil")
	}
}

func TestInitConfigFileNotFound(t *testing.T) {
	resetViper()
	Init("/nonexistent/path/to/config.yaml")
	_, err := GetAll()
	if err == nil {
		t.Fatal("expected error due to missing required fields")
	}
}
