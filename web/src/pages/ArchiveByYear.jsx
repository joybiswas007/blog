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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchArchiveByYear();
  }, [fetchArchiveByYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--color-text-secondary)]">Loading posts...</div>
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
      <div className="w-full max-w-3xl px-4 py-8 md:py-12">
        <h1 className="text-4xl font-heading font-bold text-blue-300 mb-8 text-center">
          Archive: {year}
        </h1>
        {posts && posts.length > 0 ? (
          <div className="relative border-l-2 border-neutral-700 ml-4 md:ml-0">
            {posts.map((post, index) => (
              <div key={index} className="mb-8 flex items-center w-full">
                <div className="absolute -left-2.5 w-5 h-5 bg-blue-500 rounded-full"></div>
                <div className="ml-8 w-full">
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:border-blue-700 transition-colors">
                    <Link to={`/posts/${post.slug}`} className="block">
                      <h2 className="text-xl font-heading text-blue-300 mb-1">
                        {post.title}
                      </h2>
                      <p className="text-sm text-neutral-400 font-mono">
                        {formatDate(post.created_at)}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-400">No posts found for this year.</p>
        )}
        <div className="mt-12 text-center">
          <Link
            to="/archives"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Archives
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArchiveByYear;
