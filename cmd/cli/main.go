package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/joybiswas007/blog/config"
	"github.com/joybiswas007/blog/internal/database"
	"github.com/joybiswas007/blog/internal/pkg"
)

// application represents the configuration for the blog application
// containing user credentials and configuration file path
type application struct {
	configFile string   // path to configuration file
	name       string   // full name of the user
	email      string   // email address for authentication
	password   password // password for authentication
}

type password struct {
	password string //password for authentication
	reset    bool   //reset if user want to reset password
}

func main() {
	var app application

	// Define command-line flags and bind them to the application struct
	flag.StringVar(&app.configFile, "conf", "",
		"Path to configuration file (default: $PWD/.joyblog.yaml)")
	flag.StringVar(&app.name, "name", "",
		"Your full name (e.g. 'John Smith') for account creation")
	flag.StringVar(&app.email, "email", "",
		"Email address to use for your account")
	flag.StringVar(&app.password.password, "pass", "",
		"Account password (leave empty to auto-generate a secure password)")
	flag.BoolVar(&app.password.reset, "reset-pass", false,
		"Reset user password")

	flag.Parse()

	config.Init(app.configFile)

	if app.email == "" {
		panic("email can't be empty")
	}

	if app.password.password == "" {
		app.password.password = pkg.GeneratePassword(30, true, true, true)
	}

	cfg, err := config.GetAll()
	if err != nil {
		log.Fatal(err)
	}

	db := database.New(cfg.DB)
	defer func() {
		db.Close()
	}()

	models := database.NewModels(db)

	if app.password.reset {
		user, err := models.Users.GetByEmail(app.email)
		if err != nil {
			log.Fatal(err)
		}
		u := &database.User{
			ID: user.ID,
		}

		err = u.Password.Set(app.password.password)
		if err != nil {
			log.Fatal(err)
		}

		err = models.Users.UpdatePassword(u)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("Password update successfull!")
		fmt.Printf("New password: %s\n", app.password.password)

		return
	}

	if app.name == "" {
		panic("name can't be empty")
	}

	user := &database.User{
		Name:  app.name,
		Email: app.email,
	}

	err = user.Password.Set(app.password.password)
	if err != nil {
		log.Fatal(err)
	}

	_, err = models.Users.Insert(user)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Registration successfull!")
	fmt.Println("Email: " + app.email)
	fmt.Println("Password: " + app.password.password)
	fmt.Println("Use the ^^ creds for login")
}
