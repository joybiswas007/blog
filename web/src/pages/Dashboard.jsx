import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { ErrorMessage, LoadingSpinner } from "@/components/PostForm";
import { clearAuthTokens } from "@/utils/auth";
import {
  FiEdit2,
  FiTrash2,
  FiLogOut,
  FiPlus,
  FiSend,
  FiFileText,
  FiClock,
  FiTag
} from "react-icons/fi";
import { GiAngryEyes } from "react-icons/gi";
import DashboardSkeleton from "@/components/DashboardSkeleton";

// Utility functions for post metadata
const calculateWordCount = content => {
  if (!content) return 0;
  return content.trim().split(/\s+/).length;
};

const calculateReadingTime = wordCount => {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
};

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

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <>
      <title>Dashboard</title>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded">
          <Link
            to="/auth/posts/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-medium font-sans bg-[var(--color-accent-primary)] text-[var(--color-sidebar-bg)] border border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)] hover:-translate-y-px hover:shadow-lg"
          >
            <FiPlus size={24} />
            <span>New Post</span>
          </Link>
          <Link
            to="/auth/login-attempts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-medium font-sans bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-active-bg)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] hover:-translate-y-px"
          >
            <GiAngryEyes size={24} />
            <span>Login Attempts</span>
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans text-[var(--color-syntax-variable)] bg-[var(--color-hover-bg)] border border-[var(--color-active-bg)] hover:bg-[rgba(224,108,117,0.1)] hover:border-[var(--color-syntax-variable)] hover:-translate-y-px"
            type="button"
          >
            <FiLogOut size={24} />
            <span>Logout</span>
          </button>
        </div>

        {/* Tabs & Stats */}
        <div className="flex items-center justify-between p-4 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded">
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded text-sm font-medium transition-all font-sans border ${activeTab === "published"
                ? "text-[var(--color-text-primary)] bg-[var(--color-active-bg)] border-[var(--color-accent-primary)]"
                : "text-[var(--color-text-secondary)] bg-transparent border-transparent hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover-bg)]"
                }`}
              onClick={() => setActiveTab("published")}
              type="button"
            >
              Published
            </button>
            <button
              className={`px-4 py-2 rounded text-sm font-medium transition-all font-sans border ${activeTab === "drafts"
                ? "text-[var(--color-text-primary)] bg-[var(--color-active-bg)] border-[var(--color-accent-primary)]"
                : "text-[var(--color-text-secondary)] bg-transparent border-transparent hover:text-[var(--color-text-primary)] hover:bg-[var(--color-hover-bg)]"
                }`}
              onClick={() => setActiveTab("drafts")}
              type="button"
            >
              Drafts
            </button>
          </div>
          <div className="text-xs font-mono text-[var(--color-text-secondary)]">
            {totalPosts} {activeTab === "published" ? "published" : "draft"}{" "}
            post{totalPosts !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-l-none">
            <ErrorMessage error={error} />
          </div>
        )}

        {/* Posts List */}
        <div className="min-h-[400px]">
          {loading ? (
            <DashboardSkeleton count={8} />
          ) : !posts || posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4 bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)] text-[32px]">
                <FiFileText />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-sans text-[var(--color-text-primary)]">
                No {activeTab === "published" ? "published posts" : "drafts"}{" "}
                yet
              </h3>
              <p className="text-sm mb-6 text-[var(--color-text-secondary)]">
                {activeTab === "published"
                  ? "Start writing and publish your first post"
                  : "Create a draft to get started"}
              </p>
              <Link
                to="/auth/posts/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-medium font-sans bg-[var(--color-accent-primary)] text-[var(--color-sidebar-bg)] border border-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] hover:-translate-y-px hover:shadow-lg"
              >
                <FiPlus />
                <span>Create Post</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-0 border border-[var(--color-panel-border)] rounded overflow-hidden bg-[var(--color-sidebar-bg)]">
              {posts.map((post, index) => {
                const wordCount = calculateWordCount(post.content);
                const readingTime = calculateReadingTime(wordCount);
                const displayTags = post.tags?.slice(0, 3) || [];

                return (
                  <div
                    key={post.id}
                    className="group transition-all border-b border-b-[var(--color-editor-bg)] border-l-2 border-l-transparent last:border-b-0 hover:bg-[var(--color-hover-bg)] hover:border-l-[var(--color-accent-primary)] animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="flex items-start justify-between px-4 py-3 gap-4">
                      {/* Post Info */}
                      <Link
                        to={`/posts/${post.slug}`}
                        className="flex-1 flex flex-col gap-2 no-underline min-w-0"
                      >
                        {/* Title */}
                        <div className="text-sm font-medium font-sans text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">
                          {post.title || (
                            <span className="italic text-[var(--color-text-muted)]">
                              Untitled
                            </span>
                          )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--color-text-secondary)]">
                          {/* Date */}
                          <span className="whitespace-nowrap">
                            {formatDate(post.created_at)}
                          </span>

                          {/* Reading Time */}
                          {wordCount > 0 && (
                            <>
                              <span className="text-[var(--color-text-muted)]">•</span>
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <FiClock className="w-3 h-3" />
                                {readingTime} min read
                              </span>
                            </>
                          )}

                          {/* Word Count */}
                          {wordCount > 0 && (
                            <>
                              <span className="text-[var(--color-text-muted)]">•</span>
                              <span className="whitespace-nowrap">
                                {wordCount.toLocaleString()} words
                              </span>
                            </>
                          )}

                          {/* Tags Preview */}
                          {displayTags.length > 0 && (
                            <>
                              <span className="text-[var(--color-text-muted)]">•</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <FiTag className="w-3 h-3" />
                                {displayTags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[var(--color-accent-primary)]"
                                  >
                                    #{tag}
                                    {idx < displayTags.length - 1 && ","}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-[var(--color-text-muted)]">
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </Link>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {activeTab === "drafts" && (
                          <button
                            onClick={() => handlePublish(post.id)}
                            className="flex items-center justify-center w-8 h-8 rounded transition-all text-[var(--color-text-secondary)] bg-transparent border border-transparent hover:bg-[var(--color-hover-bg)] hover:border-[var(--color-active-bg)] hover:text-[var(--color-syntax-string)] hover:border-[var(--color-syntax-string)]"
                            title="Publish"
                            type="button"
                          >
                            <FiSend />
                          </button>
                        )}
                        <Link
                          to={`/auth/posts/${post.id}/edit`}
                          className="flex items-center justify-center w-8 h-8 rounded transition-all text-[var(--color-text-secondary)] bg-transparent border border-transparent hover:bg-[var(--color-hover-bg)] hover:border-[var(--color-active-bg)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)]"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="flex items-center justify-center w-8 h-8 rounded transition-all text-[var(--color-text-secondary)] bg-transparent border border-transparent hover:bg-[var(--color-hover-bg)] hover:border-[var(--color-active-bg)] hover:text-[var(--color-syntax-variable)] hover:border-[var(--color-syntax-variable)]"
                          title="Delete"
                          type="button"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {posts && posts.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 py-4 border-t border-t-[var(--color-panel-border)]">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-sans text-[var(--color-text-primary)] bg-[var(--color-hover-bg)] border border-[var(--color-active-bg)] ${pagination.page === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)]"
                }`}
              disabled={pagination.page === 1}
              type="button"
            >
              <span>←</span>
              <span>Previous</span>
            </button>
            <span className="text-sm font-mono text-[var(--color-text-secondary)]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-sans text-[var(--color-text-primary)] bg-[var(--color-hover-bg)] border border-[var(--color-active-bg)] ${pagination.page === pagination.totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)]"
                }`}
              disabled={pagination.page === pagination.totalPages}
              type="button"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
