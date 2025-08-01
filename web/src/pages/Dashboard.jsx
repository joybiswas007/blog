import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { ErrorMessage, LoadingSpinner } from "@/components/PostForm";
import { clearAuthTokens } from "@/utils/auth";
import {
  FiEdit2,
  FiTrash2,
  FiLogOut,
  FiKey,
  FiPlus,
  FiSend,
  FiTool
} from "react-icons/fi";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("published");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPosts: 0,
    totalPages: 1
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthTokens();
    navigate("/login");
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const offset = (pagination.page - 1) * pagination.limit;
      const response = await api.get(
        `/auth/posts?limit=${pagination.limit}&offset=${offset}&order_by=created_at&sort=DESC&is_published=${activeTab === "published"}`
      );

      setPosts(response.data.posts);
      setTotalPosts(response.data.total_post);
      setPagination(prev => ({
        ...prev,
        totalPosts: response.data.total_post,
        totalPages: Math.ceil(response.data.total_post / prev.limit)
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async postId => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/auth/posts/${postId}`);
        fetchPosts();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete post");
      }
    }
  };

  const handlePublish = async postId => {
    try {
      await api.post(`/auth/posts/publish/${postId}`);
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish post");
    }
  };

  const handlePageChange = newPage => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="flex justify-center w-full">
      <title>Dashboard</title>
      <div className="space-y-8 w-full max-w-3xl">
        {/* Top actions bar */}
        <div className="flex justify-center items-center gap-4 pl-4 ml-2">
          <Link
            to="/auth/tools"
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-medium font-mono text-blue-300 hover:text-blue-200 text-white text-sm transition-colors"
          >
            <FiTool className="w-5 h-5" />
            Toolbox
          </Link>

          <Link
            to="/auth/posts/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-medium font-mono text-blue-300 hover:text-blue-200 text-white text-sm transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            New Post
          </Link>
          <Link
            to="/auth/reset-password"
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-medium font-mono text-blue-300 hover:text-blue-200 text-sm transition-colors"
          >
            <FiKey className="w-5 h-5" />
            Reset Password
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-medium font-mono text-blue-300 hover:text-blue-200 text-sm transition-colors"
            type="button"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Tab switcher with post count */}
        <div className="flex justify-start items-center space-x-4 pl-4 ml-2">
          <p className="text-[var(--color-text-secondary)] text-sm font-mono">
            View:
          </p>
          <button
            className={`px-2 py-1 rounded font-mono transition-colors ${
              activeTab === "published"
                ? "bg-blue-900 text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
            onClick={() => setActiveTab("published")}
            tabIndex={0}
            aria-label="Show published posts"
            type="button"
          >
            Published
          </button>
          <button
            className={`px-2 py-1 rounded font-mono transition-colors ${
              activeTab === "drafts"
                ? "bg-blue-900 text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
            onClick={() => setActiveTab("drafts")}
            tabIndex={0}
            aria-label="Show drafts"
            type="button"
          >
            Drafts
          </button>
          <span className="text-[var(--color-text-secondary)] text-xs font-mono">
            |
          </span>
          <span className="text-[var(--color-text-secondary)] text-xs font-mono">
            {totalPosts} {activeTab === "published" ? "published" : "draft"}{" "}
            post{totalPosts !== 1 ? "s" : ""} total
          </span>
        </div>

        {/* Error */}
        <div className="pl-4 ml-2">
          <ErrorMessage error={error} />
        </div>

        {/* Main Content */}
        <div className="pl-4 ml-2 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-baseline gap-2 text-[var(--color-text-secondary)]">
                <span className="text-blue-500">&gt;</span>
                <p className="font-mono">
                  No {activeTab === "published" ? "published posts" : "drafts"}{" "}
                  found
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-blue-500">&gt;</span>
                <Link
                  to="/auth/posts/create"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-mono"
                >
                  Create your first post
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 text-blue-500 text-xs font-mono">
                <span>&gt;</span>
                <span className="w-[20rem] sm:w-[24rem]">TITLE</span>
                <span className="w-28 sm:w-32">DATE</span>
                <span className="w-20">ACTIONS</span>
              </div>
              {posts.map(post => (
                <div
                  key={post.id}
                  className="flex items-baseline gap-2 group transition-colors"
                >
                  <span className="text-blue-500 group-hover:text-blue-300">
                    &gt;
                  </span>
                  <Link
                    to={`/posts/${post.slug}`}
                    className="w-[20rem] sm:w-[24rem] truncate text-blue-200 group-hover:text-blue-300 transition-colors font-mono"
                  >
                    {post.title || (
                      <span className="italic text-[var(--color-text-secondary)]">
                        Untitled
                      </span>
                    )}
                  </Link>
                  <span className="text-blue-400 text-xs w-28 sm:w-32 group-hover:text-blue-300 transition-colors font-mono">
                    {post.created_at
                      ? new Date(post.created_at).toISOString().split("T")[0]
                      : "-"}
                  </span>
                  <div className="flex items-center gap-1 w-20">
                    {activeTab === "drafts" && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        className="text-blue-400 hover:text-blue-200 transition-colors p-1"
                        title="Publish"
                        type="button"
                      >
                        <FiSend className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      to={`/auth/posts/${post.id}/edit`}
                      className="text-blue-400 hover:text-blue-200 transition-colors p-1"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Delete"
                      type="button"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {posts && posts.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 pl-4 ml-2">
            {pagination.page > 1 ? (
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-mono transition-colors"
                type="button"
              >
                <span className="text-blue-500">&lt;</span>
                Prev
              </button>
            ) : (
              <span className="px-4 py-2 text-gray-500 cursor-not-allowed font-mono">
                Prev
              </span>
            )}
            <p className="text-[var(--color-text-secondary)] text-sm font-mono">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            {pagination.page < pagination.totalPages ? (
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-mono transition-colors"
                type="button"
              >
                Next
                <span className="text-blue-500">&gt;</span>
              </button>
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

export default Dashboard;
