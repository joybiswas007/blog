import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "@/services/api";
import { CalculateReadTime } from "@/utils/helpers";
import SEO from "@/components/SEO";
import { BsCalendar, BsClock, BsTags } from "react-icons/bs";

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

  // Selected sort state for dropdown
  const [selectedSort, setSelectedSort] = useState(
    SORT_OPTIONS.find(opt => opt.orderBy === orderBy && opt.sort === sort) ||
      SORT_OPTIONS[0]
  );

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

  // Handle sort change
  const handleSortChange = e => {
    const selected = SORT_OPTIONS.find(opt => opt.label === e.target.value);
    setSelectedSort(selected);
    window.location.href = buildQueryString({
      limit,
      offset: 0,
      order_by: selected.orderBy,
      sort: selected.sort,
      tag
    });
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
      <SEO />
      <div className="space-y-8 w-full max-w-3xl font-sans">
        {/* Sorting controls */}
        <div className="flex justify-start items-center space-x-4 pl-4">
          <p className="text-[var(--color-text-primary)] text-sm">Sort by:</p>
          <select
            value={selectedSort.label}
            onChange={handleSortChange}
            className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)] rounded px-2 py-1 font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Sort options"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Posts list */}
        <div className="space-y-4 pl-4">
          {loading ? (
            <div className="text-blue-400 font-mono">Loading...</div>
          ) : error ? (
            <div className="text-red-500 font-mono">{error}</div>
          ) : posts && posts.length > 0 ? (
            posts.map(post => (
              <article
                key={post.id}
                className="group rounded p-4 transition-colors"
                role="article"
              >
                <Link
                  to={`/posts/${post.slug}`}
                  className="text-[var(--color-text-primary)] hover:text-blue-300 font-medium font-mono transition-colors block mb-2"
                  aria-label={`Read post: ${post.title}`}
                >
                  <span className="text-blue-500 mr-2">&gt;</span>
                  {post.title}
                </Link>
                <div className="text-[var(--color-text-secondary)] text-xs flex flex-wrap gap-4 items-center font-mono">
                  <span className="flex items-center">
                    <BsCalendar className="text-blue-500 mr-1" />
                    {formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center">
                    <BsClock className="text-blue-500 mr-1" />
                    {CalculateReadTime(post.content)}
                  </span>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2">
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
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          aria-label={`Filter by tag ${tagVal}`}
                        >
                          #{tagVal}
                        </Link>
                      ))}
                    </div>
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
            <Link
              to={buildQueryString({
                limit,
                offset: Math.max(0, offset - limit),
                order_by: orderBy,
                sort,
                tag
              })}
              className={`px-4 py-2 font-mono transition-colors rounded ${
                offset > 0
                  ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-shade-900)]"
                  : "text-gray-500 cursor-not-allowed"
              }`}
              aria-label="Previous page"
              tabIndex={offset > 0 ? 0 : -1}
            >
              <span className="text-blue-500 mr-1">&lt;</span>
              Prev
            </Link>
            <p className="text-[var(--color-text-secondary)] text-sm font-mono">
              Page {currentPage} of {totalPages}
            </p>
            <Link
              to={buildQueryString({
                limit,
                offset: offset + limit,
                order_by: orderBy,
                sort,
                tag
              })}
              className={`px-4 py-2 font-mono transition-colors rounded ${
                offset + limit < totalPost
                  ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-shade-900)]"
                  : "text-gray-500 cursor-not-allowed"
              }`}
              aria-label="Next page"
              tabIndex={offset + limit < totalPost ? 0 : -1}
            >
              Next
              <span className="text-blue-500 ml-1">&gt;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
