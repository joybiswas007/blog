CREATE TABLE "login_attempts" (
	"id" SERIAL NOT NULL UNIQUE,
	"user_id" INTEGER NOT NULL,
	"ip" INET NOT NULL DEFAULT '0.0.0.0',
	"last_attempt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"attempts" INTEGER NOT NULL DEFAULT 0,
	"user_agent" TEXT NOT NULL DEFAULT 'Unknown',
	"banned_until" TIMESTAMPTZ,
	"bans" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id")
);

CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip);
