import { lazy, Suspense, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { BsFileText } from "react-icons/bs";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { getAuthTokens } from "@/utils/auth";
import api from "@/services/api";

import { CalculateReadTime, TruncateText } from "@/utils/helpers";

const Markdown = lazy(() => import("react-markdown"));

const PostItem = ({
  post,
  formatDate,
  buildQueryString,
  limit,
  orderBy,
  sort,
  onDelete
}) => {
  const navigate = useNavigate();
  const tagLinkParams = { limit, offset: 0, order_by: orderBy, sort };
  const { access_token } = getAuthTokens();
  const isAuthenticated = !!access_token;

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/auth/posts/${post.id}/edit`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        await api.delete(`/auth/posts/${post.id}`);
        if (onDelete) onDelete(post.id);
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete post");
      }
    }
  };

  return (
    <article className="group relative px-4 py-3 transition-all duration-150 border-l-2 border-l-transparent hover:bg-[var(--color-hover-bg)] hover:border-l-[var(--color-accent-primary)]">
      <Link
        to={`/posts/${post.slug}`}
        aria-label={`Read post: ${post.title}`}
        className="block no-underline"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h2 className="text-[15px] font-medium font-sans text-[var(--color-text-primary)] transition-colors duration-150 group-hover:text-[var(--color-accent-primary)] line-clamp-1 mb-2">
              {post.title}
            </h2>

            {/* Meta info */}
            <div className="flex items-center gap-2 mb-2 text-[11px] font-mono text-[var(--color-text-secondary)]">
              <span>{formatDate(post.created_at)}</span>
              <span>·</span>
              <span>{CalculateReadTime(post.content)}</span>
            </div>

            {/* Preview */}
            <div className="text-[13px] text-[var(--color-text-secondary)] font-sans line-clamp-2 leading-[1.6] group-hover:text-[var(--color-text-primary)] transition-colors duration-150">
              <Suspense
                fallback={
                  <span className="text-[13px] font-mono text-[var(--color-text-secondary)] animate-pulse">
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

          {/* Action Buttons - Only visible when authenticated */}
          {isAuthenticated && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <button
                onClick={handleEdit}
                className="flex items-center justify-center w-8 h-8 rounded transition-all text-[var(--color-text-secondary)] bg-transparent border border-transparent hover:bg-[var(--color-hover-bg)] hover:border-[var(--color-active-bg)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)]"
                title="Edit post"
                aria-label="Edit post"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center w-8 h-8 rounded transition-all text-[var(--color-text-secondary)] bg-transparent border border-transparent hover:bg-[var(--color-hover-bg)] hover:border-[var(--color-active-bg)] hover:text-[var(--color-syntax-variable)] hover:border-[var(--color-syntax-variable)]"
                title="Delete post"
                aria-label="Delete post"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {post.tags.map(tagVal => (
            <Link
              key={tagVal}
              to={buildQueryString({ ...tagLinkParams, tag: tagVal })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] no-underline font-mono bg-[rgba(97,175,239,0.1)] text-[var(--color-accent-primary)] transition-all duration-150 hover:bg-[rgba(97,175,239,0.2)]"
              aria-label={`Filter by tag ${tagVal}`}
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
  <div className="bg-[var(--color-sidebar-bg)] space-y-0">
    {[1, 2, 3, 4, 5].map((index) => (
      <div key={index} className="px-4 py-3 border-l-2 border-l-transparent">
        {/* Title skeleton */}
        <div className="h-5 bg-[var(--color-hover-bg)] rounded animate-shimmer mb-2 w-3/4"></div>

        {/* Meta info skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 bg-[var(--color-hover-bg)] rounded animate-shimmer w-20"></div>
          <div className="h-3 w-1 bg-[var(--color-hover-bg)] rounded"></div>
          <div className="h-3 bg-[var(--color-hover-bg)] rounded animate-shimmer w-16"></div>
        </div>

        {/* Preview skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-[var(--color-hover-bg)] rounded animate-shimmer w-full"></div>
          <div className="h-3 bg-[var(--color-hover-bg)] rounded animate-shimmer w-5/6"></div>
        </div>

        {/* Tags skeleton */}
        <div className="flex items-center gap-2 mt-3">
          <div className="h-5 bg-[var(--color-hover-bg)] rounded animate-shimmer w-16"></div>
          <div className="h-5 bg-[var(--color-hover-bg)] rounded animate-shimmer w-20"></div>
        </div>

        {index < 5 && <div className="h-px bg-[var(--color-editor-bg)] mx-0 mt-3" />}
      </div>
    ))}
  </div>
);

const ErrorState = ({ error }) => (
  <div className="mx-4 px-4 py-3 rounded-l-none bg-[rgba(224,108,117,0.1)] border-l-4 border-l-[var(--color-syntax-variable)] text-[var(--color-syntax-variable)] font-mono text-[13px]">
    <strong className="font-semibold">Error:</strong> {error}
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
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--color-hover-bg)] mb-4">
        <BsFileText className="w-7 h-7 text-[var(--color-text-secondary)]" />
      </div>
      <h3 className="text-base font-medium mb-2 font-sans text-[var(--color-text-primary)]">
        No posts found
      </h3>
      <p className="text-[13px] max-w-md text-[var(--color-text-secondary)] leading-relaxed">
        {tag ? (
          <>
            No posts tagged with{" "}
            <strong className="font-semibold text-[var(--color-accent-primary)]">#{tag}</strong>.
            Try removing the filter or{" "}
            <Link
              to={allPostsLink}
              className="no-underline text-[var(--color-accent-primary)] transition-colors duration-150 hover:text-[var(--color-accent-hover)] hover:underline"
            >
              view all posts
            </Link>
            .
          </>
        ) : (
          <>
            No posts available yet.{" "}
            <Link
              to={allPostsLink}
              className="no-underline text-[#61afef] transition-colors duration-150 hover:text-[#84c0f4] hover:underline"
            >
              Refresh
            </Link>{" "}
            to check for new content.
          </>
        )}
      </p>
    </div>
  );
};

const PostsList = ({ posts, loading, error, onPostDeleted, ...props }) => {
  const [localPosts, setLocalPosts] = useState(posts);

  // Update local posts when props change
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleDelete = (postId) => {
    setLocalPosts(prev => prev.filter(p => p.id !== postId));
    if (onPostDeleted) onPostDeleted(postId);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!localPosts || localPosts.length === 0) return <NoPostsFound {...props} />;

  return (
    <div className="bg-[var(--color-sidebar-bg)]">
      {localPosts.map((post, index) => (
        <div
          key={post.id}
          className={`animate-fade-in opacity-0 stagger-${Math.min(index + 1, 5)}`}
        >
          <PostItem post={post} onDelete={handleDelete} {...props} />
          {index < localPosts.length - 1 && (
            <div className="h-px bg-[var(--color-editor-bg)] mx-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PostsList;
