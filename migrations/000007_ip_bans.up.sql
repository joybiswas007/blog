CREATE TABLE "ip_bans" (
	"id" SERIAL NOT NULL UNIQUE,
	"from_ip" INTEGER NOT NULL UNIQUE,
	"to_ip" INTEGER NOT NULL UNIQUE,
	"reason" TEXT NOT NULL DEFAULT 'Automated ban per >60 failed login attempts',
	PRIMARY KEY("id")
);

CREATE INDEX idx_ip_bans_to_ip ON ip_bans(to_ip);

