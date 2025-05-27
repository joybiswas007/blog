CREATE TABLE "users" (
	"id" serial NOT NULL UNIQUE,
	"name" text NOT NULL,
	"email" text UNIQUE NOT NULL,
	"password_hash" bytea NOT NULL,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY("id")
);
