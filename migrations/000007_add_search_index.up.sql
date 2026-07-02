CREATE INDEX IF NOT EXISTS blog_posts_search_idx ON "blog_posts" USING gin (
    (
        setweight(to_tsvector('simple', "title"), 'A') ||
        setweight(to_tsvector('simple', COALESCE("description", '')), 'B') ||
        setweight(to_tsvector('simple', "content"), 'C')
    )
);
