import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "@/services/api";
import { CalculateReadTime } from "@/utils/helpers";
import SEO from "@/components/SEO";
import {
  BsCalendar,
  BsClock,
  BsTags,
  BsFire,
  BsArrowRight
} from "react-icons/bs";

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

const TopPostsPanel = ({ topPosts, topError, onClose }) => {
  if (topPosts.length === 0) return null; // Don't display if empty

  return (
    <div className="fixed right-6 bottom-6 z-10">
      <div className="bg-[var(--color-background-primary)] rounded-lg p-4 w-64 shadow-lg">
        <div className="flex items-center mb-3">
          <BsFire className="text-orange-500 mr-2" />
          <h3 className="text-[var(--color-text-primary)] font-mono text-sm">
            Top 10 posts
          </h3>
          <button
            onClick={onClose}
            className="ml-auto text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs"
            aria-label="Close top posts"
          >
            &times;
          </button>
        </div>
        {topError ? (
          <div className="text-red-500 font-mono text-xs text-center py-2">
            {topError}
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {topPosts.map((topPost, index) => (
              <div key={topPost.id} className="py-1">
                <Link
                  to={`/posts/${topPost.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-start"
                  aria-label={`Read top post: ${topPost.title}`}
                >
                  <span className="text-orange-500 font-bold mr-2 shrink-0">
                    #{index + 1}
                  </span>
                  <span className="line-clamp-2">{topPost.title}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SortingControls = ({
  selectedSort,
  handleSortChange,
  tag,
  buildQueryString,
  limit,
  offset,
  orderBy,
  sort
}) => (
  <div className="flex justify-between items-center px-4 py-3">
    <div className="flex items-center space-x-4">
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

    {tag && (
      <div className="flex items-center">
        <span className="text-[var(--color-text-secondary)] text-sm mr-2">
          Filter:
        </span>
        <span className="text-blue-400 font-mono text-sm">#{tag}</span>
        <Link
          to={buildQueryString({
            limit,
            offset: 0,
            order_by: orderBy,
            sort
          })}
          className="ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm"
          aria-label="Clear filter"
        >
          &times;
        </Link>
      </div>
    )}
  </div>
);

const PostsList = ({
  posts,
  loading,
  error,
  tag,
  buildQueryString,
  limit,
  offset,
  orderBy,
  sort,
  formatDate
}) => (
  <div className="space-y-8">
    {loading ? (
      <div className="flex justify-center py-12">
        <div className="text-blue-400 font-mono">Loading articles...</div>
      </div>
    ) : error ? (
      <div className="text-red-500 font-mono text-center py-8">{error}</div>
    ) : posts.length > 0 ? (
      posts.map(post => (
        <article
          key={post.id} // Fixed key to use post.id instead of index
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

const PaginationControls = ({
  totalPost,
  limit,
  offset,
  currentPage,
  totalPages,
  buildQueryString,
  orderBy,
  sort,
  tag
}) =>
  totalPost > limit && (
    <div className="flex justify-center items-center space-x-6 mt-12 pt-8">
      <Link
        to={buildQueryString({
          limit,
          offset: Math.max(0, offset - limit),
          order_by: orderBy,
          sort,
          tag
        })}
        className={`font-mono transition-colors flex items-center ${
          offset > 0
            ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            : "text-gray-500 cursor-not-allowed"
        }`}
        aria-label="Previous page"
        tabIndex={offset > 0 ? 0 : -1}
      >
        <span className="text-blue-500 mr-1">&lt;</span>
        Previous
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
        className={`font-mono transition-colors flex items-center ${
          offset + limit < totalPost
            ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            : "text-gray-500 cursor-not-allowed"
        }`}
        aria-label="Next page"
        tabIndex={offset + limit < totalPost ? 0 : -1}
      >
        Next
        <span className="text-blue-500 ml-1">&gt;</span>
      </Link>
    </div>
  );

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
  const [topPosts, setTopPosts] = useState([]);
  const [totalPost, setTotalPost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topError, setTopError] = useState("");
  const [showTopPosts, setShowTopPosts] = useState(false);

  // Selected sort state for dropdown
  const [selectedSort, setSelectedSort] = useState(
    SORT_OPTIONS.find(opt => opt.orderBy === orderBy && opt.sort === sort) ||
      SORT_OPTIONS[0]
  );

  // Reference for intersection observer
  const observerTarget = useRef(null);

  // Fetch regular posts
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
        setPosts(response.data.posts || []); // Ensure posts is always an array
        setTotalPost(response.data.total_post || 0);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [limit, offset, orderBy, sort, tag]);

  // Fetch top posts
  useEffect(() => {
    const fetchTopPosts = async () => {
      setTopError("");
      try {
        const response = await api.get("/posts/top-posts");
        setTopPosts(response.data.top_posts || []); // Ensure array
      } catch (err) {
        setTopError(err.response?.data?.error || "Failed to fetch top posts");
      }
    };
    fetchTopPosts();
  }, []);

  // Set up intersection observer to show top posts after user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowTopPosts(true);
        }
      },
      { threshold: 0.2 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, []);

  // Helper to build query string
  const buildQueryString = params => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        searchParams.set(key, value);
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
    <div className="flex justify-center w-full relative">
      <SEO />

      {showTopPosts && (
        <TopPostsPanel
          topPosts={topPosts}
          topError={topError}
          onClose={() => setShowTopPosts(false)}
        />
      )}

      <div className="space-y-4 w-full max-w-3xl font-sans">
        <SortingControls
          selectedSort={selectedSort}
          handleSortChange={handleSortChange}
          tag={tag}
          buildQueryString={buildQueryString}
          limit={limit}
          offset={offset}
          orderBy={orderBy}
          sort={sort}
        />

        <PostsList
          posts={posts}
          loading={loading}
          error={error}
          tag={tag}
          buildQueryString={buildQueryString}
          limit={limit}
          offset={offset}
          orderBy={orderBy}
          sort={sort}
          formatDate={formatDate}
        />

        {/* Observer target for top posts panel */}
        <div ref={observerTarget} className="h-1"></div>

        <PaginationControls
          totalPost={totalPost}
          limit={limit}
          offset={offset}
          currentPage={currentPage}
          totalPages={totalPages}
          buildQueryString={buildQueryString}
          orderBy={orderBy}
          sort={sort}
          tag={tag}
        />
      </div>
    </div>
  );
};

export default Home;
