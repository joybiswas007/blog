import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { CalculateReadTime } from "../utils/helpers";

// Helper to parse query params
const useQuery = () => {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
};

// Default filter values
const DEFAULT_LIMIT = 10;
const SORT_OPTIONS = [
  { orderBy: "created_at", sort: "DESC", label: "Newest" },
  { orderBy: "created_at", sort: "ASC", label: "Oldest" },
  { orderBy: "title", sort: "ASC", label: "A-Z" }
];

const Home = () => {
  const query = useQuery();

  // Filters from query params
  const limit = Number(query.limit) || DEFAULT_LIMIT;
  const offset = Number(query.offset) || 0;
  const orderBy = query.order_by || "created_at";
  const sort = query.sort || "DESC";
  const tag = query.tag || "";

  // Data state
  const [posts, setPosts] = useState([]);
  const [totalPost, setTotalPost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          limit,
          offset,
          order_by: orderBy,
          sort
        };
        if (tag) params.tag = tag;
        const response = await api.get("/posts", { params });
        setPosts(response.data.posts);
        setTotalPost(response.data.total_post);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [limit, offset, orderBy, sort, tag]);

  // Helper to build query string
  const buildQueryString = params => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    return `/?${searchParams.toString()}`;
  };

  // Format date to match original template
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  // Pagination info
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalPost / limit);

  return (
    <div className="flex justify-center w-full">
      <title>{import.meta.env.VITE_BLOG_NAME}</title>
      <div className="space-y-8 w-full max-w-3xl font-sans">
        {/* Sorting controls */}
        <div className="flex justify-start items-center space-x-4 pl-4 ml-2">
          <p className="text-[var(--color-text-secondary)] text-sm">Sort by:</p>
          {SORT_OPTIONS.map(opt => (
            <Link
              key={opt.label}
              to={buildQueryString({
                limit,
                offset: 0,
                order_by: opt.orderBy,
                sort: opt.sort,
                tag
              })}
              className={
                `px-2 py-1 font-mono transition-colors ` +
                (orderBy === opt.orderBy && sort === opt.sort
                  ? "text-blue-400"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]")
              }
              aria-label={`Sort by ${opt.label}`}
              tabIndex={0}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Posts list */}
        <div className="space-y-6 pl-4 ml-2">
          {loading ? (
            <div className="text-blue-400 font-mono">Loading...</div>
          ) : error ? (
            <div className="text-red-500 font-mono">{error}</div>
          ) : posts && posts.length > 0 ? (
            posts.map(post => (
              <article className="group" key={post.id}>
                <div className="flex items-baseline gap-2">
                  <span className="text-blue-500">&gt;</span>
                  <Link
                    to={`/posts/${post.slug}`}
                    className="text-[var(--color-text-primary)] hover:text-blue-300 hover:underline font-medium font-mono transition-colors"
                    aria-label={`Read post: ${post.title}`}
                    tabIndex={0}
                  >
                    {post.title}
                  </Link>
                </div>
                <div className="ml-4 mt-1 text-[var(--color-text-secondary)] text-xs flex flex-wrap gap-2 items-center font-mono">
                  <time>{formatDate(post.created_at)}</time>
                  <span>|</span>
                  <span>{CalculateReadTime(post.content)}</span>
                  {post.tags && post.tags.length > 0 && (
                    <>
                      <span>|</span>
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
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          aria-label={`Filter by tag ${tagVal}`}
                          tabIndex={0}
                        >
                          #{tagVal}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="flex items-baseline gap-2 text-blue-600">
              <span className="text-blue-500">&gt;</span>
              <p className="font-mono">No posts found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPost > limit && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            {offset > 0 ? (
              <Link
                to={buildQueryString({
                  limit,
                  offset: Math.max(0, offset - limit),
                  order_by: orderBy,
                  sort,
                  tag
                })}
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-mono transition-colors"
                aria-label="Previous page"
                tabIndex={0}
              >
                <span className="text-blue-500">&lt;</span>
                Prev
              </Link>
            ) : (
              <span className="px-4 py-2 text-gray-500 cursor-not-allowed font-mono">
                Prev
              </span>
            )}
            <p className="text-[var(--color-text-secondary)] text-sm font-mono">
              Page {currentPage} of {totalPages}
            </p>
            {offset + limit < totalPost ? (
              <Link
                to={buildQueryString({
                  limit,
                  offset: offset + limit,
                  order_by: orderBy,
                  sort,
                  tag
                })}
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-mono transition-colors"
                aria-label="Next page"
                tabIndex={0}
              >
                Next
                <span className="text-blue-500">&gt;</span>
              </Link>
            ) : (
              <span className="px-4 py-2 text-gray-500 cursor-not-allowed font-mono">
                Next
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
