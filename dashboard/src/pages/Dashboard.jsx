import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ErrorMessage, LoadingSpinner } from "../components/PostForm";
import { clearAuthTokens } from "../utils/auth";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("published"); // 'published' or 'drafts'
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const offset = (pagination.page - 1) * pagination.limit;
      const response = await api.get(
        `/posts?limit=${pagination.limit}&offset=${offset}&order_by=created_at&sort=DESC&is_published=${activeTab === "published"}`
      );

      setPosts(response.data.posts);
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
  };

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, activeTab]);

  const handleDelete = async postId => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${postId}`);
        fetchPosts();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete post");
      }
    }
  };

  const handlePublish = async postId => {
    try {
      await api.post(`/posts/publish/${postId}`);
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">Dashboard</h1>
          <Link
            to="/posts/create"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
          >
            Create New Post
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "published" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-gray-300"}`}
            onClick={() => setActiveTab("published")}
          >
            Published Posts
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "drafts" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-gray-300"}`}
            onClick={() => setActiveTab("drafts")}
          >
            Drafts
          </button>
        </div>

        <ErrorMessage error={error} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : posts === null ? (
          <div className="text-center py-12 text-gray-400">
            {activeTab === "published"
              ? "No published posts found."
              : "No drafts found."}
          </div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {posts.map(post => (
                      <tr
                        key={post.id}
                        className="hover:bg-gray-750 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {post.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {post.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {post.tags?.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          {activeTab === "drafts" && (
                            <button
                              onClick={() => handlePublish(post.id)}
                              className="text-emerald-400 hover:text-emerald-300"
                              title="Publish"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )}
                          <Link
                            to={`/posts/${post.id}/edit`}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalPosts
                )}{" "}
                of {pagination.totalPosts}{" "}
                {activeTab === "published" ? "posts" : "drafts"}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-lg border border-gray-600 text-sm ${
                    pagination.page === 1
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 rounded-lg border border-gray-600 text-sm ${
                    pagination.page === pagination.totalPages
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
