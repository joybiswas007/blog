// Package pkg provides utility functions and shared helpers for the blog.
package pkg

import (
	"math/rand"
	"net"
	"time"
)

// IPToUint32 converts an IPv4 address string (e.g., "192.168.0.1") to its uint32 integer representation.
// It assumes the input is a valid IPv4 address; if invalid or not IPv4, it may return 0 or panic (add error checking for production use).
// The conversion uses big-endian byte order: (ip[0] << 24) | (ip[1] << 16) | (ip[2] << 8) | ip[3].
// Returns the uint32 value.
func IPToUint32(ipStr string) uint32 {
	ip := net.ParseIP(ipStr)
	ip = ip.To4()
	return uint32(ip[0])<<24 | uint32(ip[1])<<16 | uint32(ip[2])<<8 | uint32(ip[3])
}

// IPToInt64 converts an IPv4 address string to its int64 integer representation by calling IpToUint32.
// It assumes the input is a valid IPv4 address; if invalid, behavior matches IpToUint32 (may return 0 or panic).
// Useful for signed integer comparisons in databases (e.g., ip_bans table).
// Returns the int64 value (equivalent to the uint32 cast to int64).
func IPToInt64(ipStr string) int64 {
	return int64(IPToUint32(ipStr))
}

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

	// Fallback if no character sets are selected.
	if charPool == "" {
		charPool = letterBytes + numBytes // Default to letters+numbers
	}

	b := make([]byte, length)
	for i := range b {
		b[i] = charPool[rand.Intn(len(charPool))]
	}
	return string(b)
}
