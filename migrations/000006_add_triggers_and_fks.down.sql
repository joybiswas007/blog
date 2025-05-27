DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON "blog_posts";
DROP FUNCTION IF EXISTS update_updated_at_column();
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS fk_blog_posts_user;
ALTER TABLE "blog_tag" DROP CONSTRAINT IF EXISTS fk_blog_tag_blog;
ALTER TABLE "blog_tag" DROP CONSTRAINT IF EXISTS fk_blog_tag_tag;
ALTER TABLE "tokens" DROP CONSTRAINT IF EXISTS fk_tokens_user;
