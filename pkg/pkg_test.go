package pkg

import (
	"testing"
	"unicode"
)

func assertIpConversion(t *testing.T, ip string, wantUint32 uint32, wantInt64 int64) {
	t.Helper()

	gotUint32 := IpToUint32(ip)
	if gotUint32 != wantUint32 {
		t.Errorf("IpToUint32(%q) = %d, want %d", ip, gotUint32, wantUint32)
	}

	gotInt64 := IpToInt64(ip)
	if gotInt64 != wantInt64 {
		t.Errorf("IpToInt64(%q) = %d, want %d", ip, gotInt64, wantInt64)
	}
}

func TestIpConversions(t *testing.T) {
	assertIpConversion(t, "0.0.0.0", 0, 0)
	assertIpConversion(t, "127.0.0.1", 2130706433, 2130706433)
	assertIpConversion(t, "255.255.255.255", 4294967295, 4294967295)
	assertIpConversion(t, "192.168.1.1", 3232235777, 3232235777)
	assertIpConversion(t, "8.8.8.8", 134744072, 134744072)
}

func TestGeneratePassword(t *testing.T) {
	tests := []struct {
		name        string
		length      int
		useLetter   bool
		useDigits   bool
		useSpecial  bool
		wantLetters bool
		wantDigits  bool
		wantSpecial bool
	}{
		{
			name:        "all character types",
			length:      20,
			useLetter:   true,
			useDigits:   true,
			useSpecial:  true,
			wantLetters: true,
			wantDigits:  true,
			wantSpecial: true,
		},
		{
			name:        "only letters",
			length:      20,
			useLetter:   true,
			useDigits:   false,
			useSpecial:  false,
			wantLetters: true,
			wantDigits:  false,
			wantSpecial: false,
		},
		{
			name:        "letters and digits",
			length:      20,
			useLetter:   true,
			useDigits:   true,
			useSpecial:  false,
			wantLetters: true,
			wantDigits:  true,
			wantSpecial: false,
		},
		{
			name:        "password all types",
			length:      20,
			useLetter:   true,
			useDigits:   true,
			useSpecial:  true,
			wantLetters: true,
			wantDigits:  true,
			wantSpecial: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GeneratePassword(tt.length, tt.useLetter, tt.useSpecial, tt.useDigits)

			if len(got) != tt.length {
				t.Errorf("length = %d, want %d", len(got), tt.length)
			}

			hasLetters := containsLetters(got)
			hasDigits := containsDigits(got)
			hasSpecial := containsSpecial(got)

			if hasLetters != tt.wantLetters {
				t.Errorf("letters presence = %v, want %v (password: %s)", hasLetters, tt.wantLetters, got)
			}

			if hasDigits != tt.wantDigits {
				t.Errorf("digits presence = %v, want %v (password: %s)", hasDigits, tt.wantDigits, got)
			}

			if hasSpecial != tt.wantSpecial {
				t.Errorf("special chars presence = %v, want %v (password: %s)", hasSpecial, tt.wantSpecial, got)
			}
		})
	}
}

func containsLetters(s string) bool {
	for _, r := range s {
		if unicode.IsLetter(r) {
			return true
		}
	}
	return false
}

func containsDigits(s string) bool {
	for _, r := range s {
		if unicode.IsDigit(r) {
			return true
		}
	}
	return false
}

func containsSpecial(s string) bool {
	for _, r := range s {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && !unicode.IsSpace(r) {
			return true
		}
	}
	return false
}
