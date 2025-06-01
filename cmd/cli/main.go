package main

import (
	"flag"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/joybiswas007/blog/config"
	"github.com/joybiswas007/blog/internal/database"
)

// application represents the configuration for the blog application
// containing user credentials and configuration file path
type application struct {
	configFile      string   // path to configuration file
	name            string   // full name of the user
	email           string   // email address for authentication
	password        password // password for authentication
	deleteEmptyTags bool     // deleteEmptyTags deletes tags from the database that are not associated with any posts
}

type password struct {
	password string //password for authentication
	reset    bool   //reset if user want to reset password
}

func main() {
	var app application

	// Define command-line flags and bind them to the application struct
	flag.StringVar(&app.configFile, "conf", "",
		"Path to configuration file (default: $PWD/.blog.yaml)")
	flag.StringVar(&app.name, "name", "",
		"Your full name (e.g. 'John Smith') for account creation")
	flag.StringVar(&app.email, "email", "",
		"Email address to use for your account")
	flag.StringVar(&app.password.password, "pass", "",
		"Account password (leave empty to auto-generate a secure password)")
	flag.BoolVar(&app.password.reset, "reset-pass", false,
		"Reset user password")
	flag.BoolVar(&app.deleteEmptyTags, "delete-empty-tags", false,
		"Delete tags that are not associated with any posts")

	flag.Parse()

	config.Init(app.configFile)

	cfg, err := config.GetAll()
	if err != nil {
		log.Fatal(err)
	}

	db := database.New(cfg.DB)
	defer func() {
		db.Close()
	}()

	models := database.NewModels(db)

	if app.deleteEmptyTags {
		tags, err := models.Tags.GetAll()
		if err != nil {
			log.Fatal(err)
		}

		if len(tags) == 0 {
			fmt.Println("No tags found.")
			return
		}

		var totalEmptyTag int
		var emptyTags []*database.Tag
		for _, tag := range tags {
			// We're only looking for tags that are not associated with any posts.
			// If PostCount is not zero, the tag is ignored.
			if tag.PostCount != 0 {
				continue
			}
			emptyTags = append(emptyTags, tag)
			totalEmptyTag++
		}
		if totalEmptyTag == 0 {
			fmt.Println("No unused tags found.")
			return
		}

		var prompt string
		fmt.Printf("Found %d unused tag(s).\n", totalEmptyTag)
		fmt.Println("Are you sure you want to delete?yes/y/no/n: ")
		fmt.Scan(&prompt)

		switch strings.ToLower(prompt) {
		case "yes", "y":
			for _, tag := range emptyTags {
				err := models.Tags.Delete(tag.ID)
				if err != nil {
					log.Fatal(err)
				}
			}
			fmt.Printf("%d unused tags deleted.\n", totalEmptyTag)
		case "no", "n":
			fmt.Println("No tags were deleted.")
		default:
			log.Printf("Unknown prompt type %s", prompt)
		}

		return
	}

	if app.email == "" {
		log.Fatal("email can't be empty")
	}

	if app.password.password == "" {
		app.password.password = generatePassword(30, true, true, true)
	}

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
		fmt.Println("Password update successful!")
		fmt.Printf("New password: %s\n", app.password.password)

		return
	}

	if app.name == "" {
		log.Fatal("name can't be empty")
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

	fmt.Println("Registration successful!")
	fmt.Println("Email: " + app.email)
	fmt.Println("Password: " + app.password.password)
	fmt.Println("Use the ^^ creds for login")
}

const (
	letterBytes  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	specialBytes = "!@#$%^&*()-_=+,.?/:;{}[]~"
	numBytes     = "0123456789"
)

// generatePassword creates a random password with specified character sets.
// Parameters:
//   - length:      Desired password length
//   - useLetters:  Include alphabetic characters
//   - useSpecial:  Include special characters
//   - useNum:      Include numeric characters
func generatePassword(length int, useLetters, useSpecial, useNum bool) string {
	rand.NewSource(time.Now().UnixNano())

	var charPool string
	if useLetters {
		charPool += letterBytes
	}
	if useSpecial {
		charPool += specialBytes
	}
	if useNum {
		charPool += numBytes
	}

	// Fallback if no character sets are selected
	if charPool == "" {
		charPool = letterBytes + numBytes // Default to letters+numbers
	}

	b := make([]byte, length)
	for i := range b {
		b[i] = charPool[rand.Intn(len(charPool))]
	}
	return string(b)
}
