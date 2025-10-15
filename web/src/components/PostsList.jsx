import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";

import { CalculateReadTime, TruncateText } from "@/utils/helpers";

const Markdown = lazy(() => import("react-markdown"));

const PostItem = ({
  post,
  formatDate,
  buildQueryString,
  limit,
  orderBy,
  sort
}) => {
  const tagLinkParams = { limit, offset: 0, order_by: orderBy, sort };

  return (
    <article className="post-file-item">
      <Link
        to={`/posts/${post.slug}`}
        aria-label={`Read post: ${post.title}`}
        className="block"
      >
        <div className="flex-1 min-w-0">
          <h2 className="post-file-title mb-2">{post.title}</h2>

          <div className="flex items-center gap-4 mb-2">
            <span className="post-file-meta">
              {formatDate(post.created_at)}
            </span>
            <span className="post-file-meta">
              {CalculateReadTime(post.content)}
            </span>
          </div>

          <div className="post-file-preview">
            <Suspense
              fallback={
                <span className="posts-loading-text animate-pulse">
                  Loading preview...
                </span>
              }
            >
              <Markdown remarkPlugins={[remarkGfm]}>
                {TruncateText(post.content, 120)}
              </Markdown>
            </Suspense>
          </div>
        </div>
      </Link>

      {post.tags?.length > 0 && (
        <div className="post-file-tags mt-3">
          {post.tags.map(tagVal => (
            <Link
              key={tagVal}
              to={buildQueryString({ ...tagLinkParams, tag: tagVal })}
              className="post-tag-link"
              aria-label={`Filter by tag: ${tagVal}`}
              onClick={e => e.stopPropagation()}
            >
              #{tagVal}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
};

// --- Sub-components for different states ---

const LoadingState = () => (
  <div className="posts-loading">
    <div className="posts-loading-spinner"></div>
    <p className="posts-loading-text">Loading posts...</p>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="posts-error">
    <strong>Error:</strong> {error}
  </div>
);

const NoPostsFound = ({ tag, buildQueryString, limit }) => {
  const allPostsLink = buildQueryString({
    limit,
    offset: 0,
    order_by: "created_at",
    sort: "DESC",
    tag: undefined
  });

  return (
    <div className="posts-empty">
      <div className="posts-empty-icon" aria-hidden="true">
        📝
      </div>
      <h3 className="posts-empty-title">No posts found</h3>
      <p className="posts-empty-description">
        {tag ? (
          <>
            No posts tagged with{" "}
            <strong className="font-semibold">#{tag}</strong>. Try removing the
            filter or{" "}
            <Link to={allPostsLink} className="posts-empty-link">
              view all posts
            </Link>
            .
          </>
        ) : (
          <>
            No posts available yet.{" "}
            <Link to={allPostsLink} className="posts-empty-link">
              Refresh
            </Link>{" "}
            to check for new content.
          </>
        )}
      </p>
    </div>
  );
};

const PostsList = ({ posts, loading, error, ...props }) => {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!posts || posts.length === 0) return <NoPostsFound {...props} />;

  return (
    <div>
      {posts.map((post, index) => (
        <div key={post.id}>
          <PostItem post={post} {...props} />
          {index < posts.length - 1 && <hr className="post-separator" />}
        </div>
      ))}
    </div>
  );
};

export default PostsList;
