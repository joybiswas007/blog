import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { BsCalendar, BsClock, BsTags } from "react-icons/bs";
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
    <article className="group transition-all duration-300">
      <Link
        to={`/posts/${post.slug}`}
        aria-label={`Read post: ${post.title}`}
        className="block"
      >
        <h2 className="mb-2 text-xl text-[var(--color-text-primary)] group-hover:text-blue-300 font-medium font-mono transition-colors">
          <span className="text-blue-500 mr-2">&gt;</span>
          {post.title}
        </h2>
        <div className="pl-5">
          {" "}
          {/* Indent content to align with title */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-xs font-mono text-[var(--color-text-secondary)] mb-3">
            <span className="flex items-center">
              <BsCalendar className="text-blue-500 mr-1.5" />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center">
              <BsClock className="text-blue-500 mr-1.5" />
              {CalculateReadTime(post.content)} min read
            </span>
          </div>
          <div className="prose prose-sm prose-invert max-w-none text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors duration-300">
            <Suspense
              fallback={
                <div className="font-mono animate-pulse">
                  Loading preview...
                </div>
              }
            >
              <Markdown remarkPlugins={[remarkGfm]}>
                {TruncateText(post.content, 200)}
              </Markdown>
            </Suspense>
          </div>
        </div>
      </Link>

      {/* Tags are kept separate so they don't navigate to the post */}
      {post.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-4 pl-5">
          <BsTags className="text-blue-500" />
          {post.tags.map(tagVal => (
            <Link
              key={tagVal}
              to={buildQueryString({ ...tagLinkParams, tag: tagVal })}
              className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-mono"
              aria-label={`Filter by tag: ${tagVal}`}
              onClick={e => e.stopPropagation()} // Prevent parent Link navigation
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
  <div className="flex justify-center py-12">
    <p className="text-blue-400 font-mono">Loading posts...</p>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="text-red-500 font-mono text-center py-8">
    <p>Error: {error}</p>
  </div>
);

const NoPostsFound = ({ tag, buildQueryString, limit }) => {
  // Build a link to clear the current tag filter
  const allPostsLink = buildQueryString({
    limit,
    offset: 0,
    order_by: "created_at",
    sort: "DESC",
    tag: undefined
  });

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4" aria-hidden="true">
        📝
      </div>
      <div className="flex items-baseline gap-2 text-blue-600 mb-2">
        <span className="text-blue-500">&gt;</span>
        <p className="font-mono text-lg">No posts found</p>
      </div>
      <p className="text-[var(--color-text-secondary)] text-sm max-w-md">
        {tag ? (
          <>
            No posts tagged with{" "}
            <strong className="font-semibold text-blue-400">#{tag}</strong>. Try
            removing the filter or{" "}
          </>
        ) : (
          "No posts available yet. "
        )}
        <Link
          to={allPostsLink}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          view all posts
        </Link>
        .
      </p>
    </div>
  );
};

const PostsList = ({ posts, loading, error, ...props }) => {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!posts || posts.length === 0) return <NoPostsFound {...props} />;

  return (
    <div className="space-y-12">
      {posts.map(post => (
        <PostItem key={post.id} post={post} {...props} />
      ))}
    </div>
  );
};

export default PostsList;
