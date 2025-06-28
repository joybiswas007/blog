package database

import (
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	pool   *pgxpool.Pool
	models Models
)

func TestMain(m *testing.M) {
	connStr := os.Getenv("TEST_DB_URL")
	if connStr == "" {
		panic("expected TEST_DB_URL but received empty string")
	}

	db, err := New(connStr)
	if err != nil {
		panic("passed database connection string and received: " + err.Error())
	}

	defer db.Close()

	pool = db

	models = NewModels(pool)

	os.Exit(m.Run())
}

func TestUser(t *testing.T) {
	t.Run("inserting user", func(t *testing.T) {
		user := &User{
			Name:  "John Doe",
			Email: "john.doe@email.com",
		}

		err := user.Password.Set("Super_strong_password")
		if err != nil {
			t.Logf("want to hash and save password but got this instead: %v", err)
		}
		uid, err := models.Users.Insert(user)
		if err != nil {
			t.Fatalf("expected to insert user data but got error %v", err)
		}

		if uid == 0 {
			t.Fatalf("want user id got %d", uid)
		}
	})

	t.Run("get user by email", func(t *testing.T) {
		user, err := models.Users.GetByEmail("john.doe@email.com")
		if err != nil {
			t.Fatalf("want User{} but for %v: ", err)
		}
		if user == nil {
			t.Fatalf("want User{} but got nil value")
		}
	})
	t.Run("get user by id", func(t *testing.T) {
		user, err := models.Users.GetByID(1)
		if err != nil {
			t.Fatalf("want User{} but got %v: ", err)
		}

		if user == nil {
			t.Fatal("want User{} but got nil value")
		}
	})
}
