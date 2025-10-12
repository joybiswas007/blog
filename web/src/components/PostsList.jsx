import { Link } from "react-router-dom";
import { BsCalendar, BsClock, BsTags, BsArrowRight } from "react-icons/bs";
import { CalculateReadTime } from "@/utils/helpers";

const PostsList = ({
  posts,
  loading,
  error,
  tag,
  buildQueryString,
  limit,
  orderBy,
  sort,
  formatDate
}) => (
  <div className="space-y-8">
    {loading ? (
      <div className="flex justify-center py-12">
        <div className="text-blue-400 font-mono">Loading posts...</div>
      </div>
    ) : error ? (
      <div className="text-red-500 font-mono text-center py-8">{error}</div>
    ) : posts && posts.length > 0 ? (
      posts.map(post => (
        <article
          key={post.id}
          className="group transition-all duration-300"
          role="article"
        >
          <Link
            to={`/posts/${post.slug}`}
            className="text-[var(--color-text-primary)] hover:text-blue-300 font-medium font-mono transition-colors block mb-3 text-xl"
            aria-label={`Read post: ${post.title}`}
          >
            <span className="text-blue-500 mr-2">&gt;</span>
            {post.title}
          </Link>

          <div className="text-[var(--color-text-secondary)] text-xs flex flex-wrap gap-4 items-center font-mono mb-3">
            <span className="flex items-center">
              <BsCalendar className="text-blue-500 mr-1" />
              {formatDate(post.created_at)}
            </span>
            <span className="flex items-center">
              <BsClock className="text-blue-500 mr-1" />
              {CalculateReadTime(post.content)}
            </span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <BsTags className="text-blue-500" />
              {post.tags.map((tagVal, index) => (
                <Link
                  key={index}
                  to={buildQueryString({
                    limit,
                    offset: 0,
                    order_by: orderBy,
                    sort,
                    tag: tagVal
                  })}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-xs"
                  aria-label={`Filter by tag ${tagVal}`}
                >
                  #{tagVal}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-3">
            <Link
              to={`/posts/${post.slug}`}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-mono transition-colors"
              aria-label={`Read post: ${post.title}`}
            >
              Read more <BsArrowRight className="ml-1" />
            </Link>
          </div>
        </article>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">📝</div>
        <div className="flex items-baseline gap-2 text-blue-600 mb-2">
          <span className="text-blue-500">&gt;</span>
          <p className="font-mono">No posts found</p>
        </div>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-md">
          {tag
            ? `No posts tagged with #${tag}. Try another tag or `
            : "No posts available yet. "}
          <Link
            to={buildQueryString({
              limit,
              offset: 0,
              order_by: "created_at",
              sort: "DESC"
            })}
            className="text-blue-400 hover:text-blue-300"
          >
            view all posts
          </Link>
        </p>
      </div>
    )}
  </div>
);

export default PostsList;
