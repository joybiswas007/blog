package config

import (
	"fmt"
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/spf13/viper"
)

// Config holds all configuration values for the application.
// Values are loaded via Viper and validated using go-playground/validator.
type Config struct {
	Port         int         `mapstructure:"port" validate:"required"`         // HTTP server port
	DB           string      `mapstructure:"db" validate:"required"`           // Database connection string (DSN)
	JWT          JWT         `mapstructure:"jwt" validate:"required"`          // JWT-related configuration
	RateLimiter  RateLimiter `mapstructure:"rate_limiter" validate:"required"` // Rate limiter configuration
	IsProduction bool        `mapstructure:"is_production"`                    // Indicates if the application is running in production mode (true) or development mode (false)
	Blog         Blog        `mapstructure:"blog" validate:"required"`         // Blog configuration
}

// JWT holds configuration related to JSON Web Tokens.
type JWT struct {
	Secret string `mapstructure:"secret" validate:"required"`  // Secret key used to sign JWT tokens
	Exp    int    `mapstructure:"exp" validate:"required"`     // Access token expiration time (in minutes or seconds)
	RefExp int    `mapstructure:"ref_exp" validate:"required"` // Refresh token expiration time
}

// RateLimiter defines the rate limiting configuration.
type RateLimiter struct {
	Rate  float64 `mapstructure:"rate" validate:"required"`  // Requests per second
	Burst int     `mapstructure:"burst" validate:"required"` // Maximum burst size allowed
}

type Blog struct {
	Name          string   `mapstructure:"name" validate:"required"`        // Name of the blog
	URL           string   `mapstructure:"url" validate:"required"`         // URL of the blog i.e: http(s)://sitename.com
	Description   string   `mapstructure:"description" validate:"required"` // Description of the blog
	Keywords      []string `mapstructure:"keywords" validate:"required"`    // Keywords for the SEO
	MarkdownTheme string   `mapstructure:"md_theme"`                        // MarkdownTheme for displaying. See more themes: https://xyproto.github.io/splash/docs/all.html
	Author        Author   `mapstructure:"author" validate:"required"`      // Author
}

// Author hold the info for who is posting
type Author struct {
	Name       string `mapstructure:"name" validate:"required"`       // Name of the author
	Profession string `mapstructure:"profession" validate:"required"` // Profession of the author
	Social     Social `mapstructure:"social" validate:"required"`     // Social media urls
}

// Social holds social media and contact information.
type Social struct {
	Github   string `mapstructure:"github" validate:"required"`      // GitHub profile URL or username (required)
	LinkedIn string `mapstructure:"linkedIn" validate:"required"`    // LinkedIn profile URL or username (required)
	Email    string `mapstructure:"email" validate:"email,required"` // Contact email address (required)
	Twitter  string `mapstructure:"twitter"`                         // Twitter handle or profile URL
	Fiverr   string `mapstructure:"fiverr"`                          // Fiverr handle or profile URL (required)
	Upwork   string `mapstructure:"upwork"`                          // Upwork handle or profile URL (required)
}

// Init reads in config file and ENV variables if set.
func Init(cfgFile string) {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find working directory.
		pwd, err := os.Getwd()
		if err != nil {
			panic(err)
		}

		// Search config in pwd directory with name ".blog" (without extension).
		viper.AddConfigPath(pwd)
		viper.SetConfigType("yaml")
		viper.SetConfigName(".blog")
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
}

// GetAll unmarshals all loaded configuration into a Config struct.
// It returns the populated Config or an error if unmarshaling fails.
func GetAll() (Config, error) {
	var config Config

	// Use Viper to unmarshal configuration values into the config struct
	if err := viper.Unmarshal(&config); err != nil {
		return Config{}, err
	}

	validate := validator.New(validator.WithRequiredStructEnabled())

	if err := validate.Struct(&config); err != nil {
		return Config{}, err
	}

	return config, nil
}
