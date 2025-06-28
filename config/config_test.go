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
  url: "https://sitename.com"
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
