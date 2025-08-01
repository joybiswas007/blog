CREATE TABLE "users_history_ips" (
	"user_id" INTEGER NOT NULL,
	"ip" INET NOT NULL DEFAULT '0.0.0.0',
	"start_time" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"end_time" TIMESTAMPTZ
);

CREATE INDEX idx_users_history_ips_user_id ON users_history_ips(user_id);
CREATE INDEX idx_users_history_ips_ip ON users_history_ips(ip);
CREATE INDEX idx_users_history_ips_start_time ON users_history_ips(start_time);
CREATE INDEX idx_users_history_ips_end_time ON users_history_ips(end_time);
