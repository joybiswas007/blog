import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/services/api";
import SEO from "@/components/SEO";

const ArchiveByYear = () => {
  const { year } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArchiveByYear = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/archives/${year}`);
      setPosts(response.data?.archive?.posts || []);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [year]);

  const formatDate = dateString => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchArchiveByYear();
  }, [fetchArchiveByYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--color-text-secondary)]">
          Loading posts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <SEO title={`Archives - ${year}`} />
      <div className="space-y-6 w-full max-w-3xl">
        <div className="pl-4 ml-2 space-y-4">
          {posts && posts.length === 0 ? (
            <div className="flex items-baseline gap-2 text-[var(--color-text-secondary)]">
              <span className="text-blue-500">&gt;</span>
              <p>No posts found in archives</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2 text-blue-500 text-xs font-mono">
                <span>&gt;</span>
                <span className="w-[22rem] sm:w-[28rem]">TITLE</span>
                <span className="w-28 sm:w-32">DATE</span>
              </div>
              {posts &&
                posts.map((post, index) => (
                  <Link
                    key={index}
                    to={`/posts/${post.slug}`}
                    className="flex items-baseline gap-2 group transition-colors"
                    tabIndex={0}
                    aria-label={`View post titled ${post.title} published on ${formatDate(post.created_at)}`}
                  >
                    <span className="text-blue-500 group-hover:text-blue-300">
                      &gt;
                    </span>
                    <span className="w-[22rem] sm:w-[28rem] truncate text-blue-200 group-hover:text-blue-300 transition-colors">
                      {post.title}
                    </span>
                    <span className="text-blue-400 text-xs w-28 sm:w-32 group-hover:text-blue-300 transition-colors">
                      {formatDate(post.created_at)}
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>
        <div className="pl-4 ml-2 pt-4">
          <Link
            to="/archives"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-300 transition-colors"
            tabIndex={0}
            aria-label="Back to archives"
          >
            <span>Back to archives</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArchiveByYear;
