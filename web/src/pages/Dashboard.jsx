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
  FiTool,
  FiFileText
} from "react-icons/fi";

const Dashboard = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;

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

  const pageTitle = `Dashboard :: ${blogName}`;

  return (
    <>
      <title>{pageTitle}</title>
      <div className="dashboard-container">
        {/* Action Toolbar */}
        <div className="dashboard-toolbar">
          <Link to="/auth/posts/create" className="dashboard-btn primary">
            <FiPlus />
            <span>New Post</span>
          </Link>
          <Link to="/auth/tools" className="dashboard-btn">
            <FiTool />
            <span>Tools</span>
          </Link>
          <Link to="/auth/reset-password" className="dashboard-btn">
            <FiKey />
            <span>Password</span>
          </Link>
          <button
            onClick={handleLogout}
            className="dashboard-btn danger"
            type="button"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>

        {/* Tabs & Stats */}
        <div className="dashboard-tabs-section">
          <div className="dashboard-tabs">
            <button
              className={`dashboard-tab ${activeTab === "published" ? "active" : ""}`}
              onClick={() => setActiveTab("published")}
              type="button"
            >
              Published
            </button>
            <button
              className={`dashboard-tab ${activeTab === "drafts" ? "active" : ""}`}
              onClick={() => setActiveTab("drafts")}
              type="button"
            >
              Drafts
            </button>
          </div>
          <div className="dashboard-stats">
            {totalPosts} {activeTab === "published" ? "published" : "draft"}{" "}
            post{totalPosts !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="dashboard-error">
            <ErrorMessage error={error} />
          </div>
        )}

        {/* Posts List */}
        <div className="dashboard-content">
          {loading ? (
            <div className="dashboard-loading">
              <LoadingSpinner />
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <FiFileText />
              </div>
              <h3 className="dashboard-empty-title">
                No {activeTab === "published" ? "published posts" : "drafts"}{" "}
                yet
              </h3>
              <p className="dashboard-empty-description">
                {activeTab === "published"
                  ? "Start writing and publish your first post"
                  : "Create a draft to get started"}
              </p>
              <Link to="/auth/posts/create" className="dashboard-btn primary">
                <FiPlus />
                <span>Create Post</span>
              </Link>
            </div>
          ) : (
            <div className="dashboard-posts-list">
              {posts.map(post => (
                <div key={post.id} className="dashboard-post-item">
                  <Link
                    to={`/posts/${post.slug}`}
                    className="dashboard-post-content"
                  >
                    <div className="dashboard-post-title">
                      {post.title || <span className="untitled">Untitled</span>}
                    </div>
                    <div className="dashboard-post-date">
                      {formatDate(post.created_at)}
                    </div>
                  </Link>
                  <div className="dashboard-post-actions">
                    {activeTab === "drafts" && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        className="dashboard-action-btn publish"
                        title="Publish"
                        type="button"
                      >
                        <FiSend />
                      </button>
                    )}
                    <Link
                      to={`/auth/posts/${post.id}/edit`}
                      className="dashboard-action-btn edit"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="dashboard-action-btn delete"
                      title="Delete"
                      type="button"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {posts && posts.length > 0 && pagination.totalPages > 1 && (
          <div className="dashboard-pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              className={`dashboard-page-btn ${pagination.page === 1 ? "disabled" : ""}`}
              disabled={pagination.page === 1}
              type="button"
            >
              <span>←</span>
              <span>Previous</span>
            </button>
            <span className="dashboard-page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              className={`dashboard-page-btn ${pagination.page === pagination.totalPages ? "disabled" : ""}`}
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
