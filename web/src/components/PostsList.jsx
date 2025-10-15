import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { BsFileText, BsClock, BsCalendar3 } from "react-icons/bs";

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
    <article className="group relative px-4 py-3 transition-all duration-150 border-l-2 border-l-transparent hover:bg-[#2c313a] hover:border-l-[#61afef]">
      <Link
        to={`/posts/${post.slug}`}
        aria-label={`Read post: ${post.title}`}
        className="block no-underline"
      >
        <div className="flex-1 min-w-0">
          {/* Title with file icon */}
          <div className="flex items-center gap-2 mb-2">
            <BsFileText className="shrink-0 w-3.5 h-3.5 text-[#61afef] group-hover:text-[#84c0f4] transition-colors" />
            <h2 className="text-[15px] font-medium font-sans text-[#abb2bf] transition-colors duration-150 group-hover:text-[#61afef] line-clamp-1">
              {post.title}
            </h2>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mb-2 ml-5">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#5c6370]">
              <BsCalendar3 className="w-3 h-3" />
              {formatDate(post.created_at)}
            </span>
            <span className="text-[#5c6370]">·</span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#5c6370]">
              <BsClock className="w-3 h-3" />
              {CalculateReadTime(post.content)}
            </span>
          </div>

          {/* Preview */}
          <div className="text-[13px] ml-5 text-[#5c6370] font-sans line-clamp-2 leading-[1.6] group-hover:text-[#abb2bf] transition-colors duration-150">
            <Suspense
              fallback={
                <span className="text-[13px] font-mono text-[#5c6370] animate-pulse">
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

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-3 ml-5">
          {post.tags.map(tagVal => (
            <Link
              key={tagVal}
              to={buildQueryString({ ...tagLinkParams, tag: tagVal })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] no-underline font-mono bg-[rgba(97,175,239,0.1)] text-[#61afef] transition-all duration-150 hover:bg-[rgba(97,175,239,0.2)]"
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
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-8 h-8 border-[3px] border-t-transparent border-[#61afef] rounded-full animate-spin mb-3"></div>
    <p className="text-[13px] font-mono text-[#5c6370]">Loading posts...</p>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="mx-4 px-4 py-3 rounded-l-none bg-[rgba(224,108,117,0.1)] border-l-4 border-l-[#e06c75] text-[#e06c75] font-mono text-[13px]">
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
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#2c313a] mb-4">
        <BsFileText className="w-7 h-7 text-[#5c6370]" />
      </div>
      <h3 className="text-base font-medium mb-2 font-sans text-[#abb2bf]">
        No posts found
      </h3>
      <p className="text-[13px] max-w-md text-[#5c6370] leading-relaxed">
        {tag ? (
          <>
            No posts tagged with{" "}
            <strong className="font-semibold text-[#61afef]">#{tag}</strong>.
            Try removing the filter or{" "}
            <Link
              to={allPostsLink}
              className="no-underline text-[#61afef] transition-colors duration-150 hover:text-[#84c0f4] hover:underline"
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

const PostsList = ({ posts, loading, error, ...props }) => {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!posts || posts.length === 0) return <NoPostsFound {...props} />;

  return (
    <div className="bg-[#21252b]">
      {posts.map((post, index) => (
        <div key={post.id}>
          <PostItem post={post} {...props} />
          {index < posts.length - 1 && (
            <div className="h-px bg-[#282c34] mx-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PostsList;
