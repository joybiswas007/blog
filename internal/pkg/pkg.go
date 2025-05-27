package pkg

import (
	"math/rand"
	"time"
)

const (
	letterBytes  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	specialBytes = "!@#$%^&*()-_=+,.?/:;{}[]~"
	numBytes     = "0123456789"
)

// GeneratePassword creates a random password with specified character sets.
// Parameters:
//   - length:      Desired password length
//   - useLetters:  Include alphabetic characters
//   - useSpecial:  Include special characters
//   - useNum:      Include numeric characters
func GeneratePassword(length int, useLetters, useSpecial, useNum bool) string {
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
