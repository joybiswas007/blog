import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { postService } from "../services/api";
import { toast } from "react-hot-toast";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    order_by: "created_at",
    sort: "DESC",
    totalPosts: 0,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { limit, offset, order_by, sort } = pagination;
        const data = await postService.getPosts({
          limit,
          offset,
          order_by,
          sort,
        });
        setPosts(data.posts);
        setPagination((prev) => ({
          ...prev,
          totalPosts: data.total_post,
        }));
      } catch (error) {
        toast.error("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [
    pagination.limit,
    pagination.offset,
    pagination.order_by,
    pagination.sort,
  ]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postService.deletePost(id);
        setPosts(posts.filter((post) => post.id !== parseInt(id)));
        // Update total posts count after deletion
        setPagination((prev) => ({
          ...prev,
          totalPosts: prev.totalPosts - 1,
        }));
        toast.success("Post deleted successfully");

        // If we deleted the last item on the page, go back one page
        if (posts.length === 1 && pagination.offset >= pagination.limit) {
          setPagination((prev) => ({
            ...prev,
            offset: prev.offset - prev.limit,
          }));
        }
      } catch (error) {
        toast.error("Failed to delete post");
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      offset: (newPage - 1) * prev.limit,
    }));
  };

  const handlePerPageChange = (e) => {
    setPagination((prev) => ({
      ...prev,
      limit: Number(e.target.value),
      offset: 0, // Reset to first page when changing items per page
    }));
  };

  const handleSortChange = (column) => {
    setPagination((prev) => ({
      ...prev,
      order_by: column,
      sort:
        prev.order_by === column
          ? prev.sort === "DESC"
            ? "ASC"
            : "DESC"
          : "DESC",
      offset: 0, // Reset to first page when changing sort
    }));
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.totalPosts / pagination.limit);

  return (
    <DashboardLayout>
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Posts</h1>
          <Link to="/posts/create" className="btn-primary">
            Create Post
          </Link>
        </div>

        {/* Items per page selector */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show
            </span>
            <select
              value={pagination.limit}
              onChange={handlePerPageChange}
              className="border rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              items per page
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: {pagination.totalPosts} posts
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : posts === null ? (
          <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange("title")}
                    >
                      <div className="flex items-center">
                        Title
                        {pagination.order_by === "title" && (
                          <span className="ml-1">
                            {pagination.sort === "DESC" ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tags
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange("created_at")}
                    >
                      <div className="flex items-center">
                        Created At
                        {pagination.order_by === "created_at" && (
                          <span className="ml-1">
                            {pagination.sort === "DESC" ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {post.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/posts/${post.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {pagination.offset + 1} to{" "}
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.totalPosts,
                )}{" "}
                of {pagination.totalPosts} posts
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${currentPage === pageNum ? "bg-blue-600 text-white" : "border dark:border-gray-600"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Posts;
