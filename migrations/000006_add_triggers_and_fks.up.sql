-- Function to auto-update the `updated_at` column on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for blog_posts table
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON "blog_posts"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Foreign key: blog_posts.user_id -> users.id
ALTER TABLE "blog_posts"
ADD CONSTRAINT fk_blog_posts_user
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON UPDATE CASCADE ON DELETE CASCADE;

-- Foreign key: blog_tag.blog_id -> blog_posts.id
ALTER TABLE "blog_tag"
ADD CONSTRAINT fk_blog_tag_blog
FOREIGN KEY ("blog_id") REFERENCES "blog_posts"("id")
ON UPDATE CASCADE ON DELETE CASCADE;

-- Foreign key: blog_tag.tag_id -> tags.id
ALTER TABLE "blog_tag"
ADD CONSTRAINT fk_blog_tag_tag
FOREIGN KEY ("tag_id") REFERENCES "tags"("id")
ON UPDATE CASCADE ON DELETE CASCADE;

-- Foreign key: tokens.user_id -> users.id
ALTER TABLE "tokens"
ADD CONSTRAINT fk_tokens_user
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON UPDATE CASCADE ON DELETE CASCADE;
