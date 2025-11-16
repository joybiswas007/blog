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
  FiFileText
} from "react-icons/fi";
import { GiAngryEyes } from "react-icons/gi";

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

  const pageTitle = "Dashboard :: Joy's Blog";

  return (
    <>
      <title>{pageTitle}</title>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#21252b] border border-[#2c313a] rounded">
          <Link
            to="/auth/posts/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-medium font-sans bg-[#61afef] text-[#21252b] border border-[#61afef] hover:bg-[#84c0f4] hover:border-[#84c0f4] hover:-translate-y-px"
          >
            <FiPlus size={24} />
            <span>New Post</span>
          </Link>
          <Link
            to="/auth/login-attempts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-medium font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] hover:-translate-y-px"
          >
            <GiAngryEyes size={24} />
            <span>Login Attempts</span>
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans text-[#e06c75] bg-[#2c313a] border border-[#353b45] hover:bg-[rgba(224,108,117,0.1)] hover:border-[#e06c75] hover:-translate-y-px"
            type="button"
          >
            <FiLogOut size={24} />
            <span>Logout</span>
          </button>
        </div>

        {/* Tabs & Stats */}
        <div className="flex items-center justify-between p-4 bg-[#21252b] border border-[#2c313a] rounded">
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded text-sm font-medium transition-all font-sans border ${
                activeTab === "published"
                  ? "text-[#abb2bf] bg-[#353b45] border-[#61afef]"
                  : "text-[#5c6370] bg-transparent border-transparent hover:text-[#abb2bf] hover:bg-[#2c313a]"
              }`}
              onClick={() => setActiveTab("published")}
              type="button"
            >
              Published
            </button>
            <button
              className={`px-4 py-2 rounded text-sm font-medium transition-all font-sans border ${
                activeTab === "drafts"
                  ? "text-[#abb2bf] bg-[#353b45] border-[#61afef]"
                  : "text-[#5c6370] bg-transparent border-transparent hover:text-[#abb2bf] hover:bg-[#2c313a]"
              }`}
              onClick={() => setActiveTab("drafts")}
              type="button"
            >
              Drafts
            </button>
          </div>
          <div className="text-xs font-mono text-[#5c6370]">
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
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4 bg-[#2c313a] text-[#5c6370] text-[32px]">
                <FiFileText />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-sans text-[#abb2bf]">
                No {activeTab === "published" ? "published posts" : "drafts"}{" "}
                yet
              </h3>
              <p className="text-sm mb-6 text-[#5c6370]">
                {activeTab === "published"
                  ? "Start writing and publish your first post"
                  : "Create a draft to get started"}
              </p>
              <Link
                to="/auth/posts/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-medium font-sans bg-[#61afef] text-[#21252b] border border-[#61afef] hover:bg-[#84c0f4] hover:-translate-y-px"
              >
                <FiPlus />
                <span>Create Post</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-0 border border-[#2c313a] rounded overflow-hidden bg-[#21252b]">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-4 py-3 transition-all border-b border-b-[#282c34] border-l-2 border-l-transparent last:border-b-0 hover:bg-[#2c313a] hover:border-l-[#61afef]"
                >
                  <Link
                    to={`/posts/${post.slug}`}
                    className="flex-1 flex items-baseline gap-4 no-underline min-w-0 group"
                  >
                    <div className="flex-1 text-sm font-medium truncate font-sans text-[#abb2bf] group-hover:text-[#61afef] transition-colors">
                      {post.title || (
                        <span className="italic text-[#4b5263]">Untitled</span>
                      )}
                    </div>
                    <div className="text-xs whitespace-nowrap font-mono text-[#5c6370] min-w-[100px]">
                      {formatDate(post.created_at)}
                    </div>
                  </Link>
                  <div className="flex items-center gap-1">
                    {activeTab === "drafts" && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        className="flex items-center justify-center w-8 h-8 rounded transition-all text-[#5c6370] bg-transparent border border-transparent hover:bg-[#2c313a] hover:border-[#353b45] hover:text-[#98c379] hover:border-[#98c379]"
                        title="Publish"
                        type="button"
                      >
                        <FiSend />
                      </button>
                    )}
                    <Link
                      to={`/auth/posts/${post.id}/edit`}
                      className="flex items-center justify-center w-8 h-8 rounded transition-all text-[#5c6370] bg-transparent border border-transparent hover:bg-[#2c313a] hover:border-[#353b45] hover:text-[#61afef] hover:border-[#61afef]"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex items-center justify-center w-8 h-8 rounded transition-all text-[#5c6370] bg-transparent border border-transparent hover:bg-[#2c313a] hover:border-[#353b45] hover:text-[#e06c75] hover:border-[#e06c75]"
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
          <div className="flex items-center justify-center gap-6 py-4 border-t border-t-[#2c313a]">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-sans text-[#abb2bf] bg-[#2c313a] border border-[#353b45] ${
                pagination.page === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-[#353b45] hover:border-[#61afef]"
              }`}
              disabled={pagination.page === 1}
              type="button"
            >
              <span>←</span>
              <span>Previous</span>
            </button>
            <span className="text-sm font-mono text-[#5c6370]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-sans text-[#abb2bf] bg-[#2c313a] border border-[#353b45] ${
                pagination.page === pagination.totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-[#353b45] hover:border-[#61afef]"
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
