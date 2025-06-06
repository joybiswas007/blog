CREATE TABLE "blog_posts" (
	"id" serial NOT NULL UNIQUE,
	"user_id" int NOT NULL,
	"title" varchar(255),
	"content" text,
	"slug" varchar(255),
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY("id")
);
