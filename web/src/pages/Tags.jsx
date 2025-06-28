import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/tags");
      setTags(response.data?.tags || []);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--color-text-secondary)]">
          Loading tags...
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
      <title>{`Tags - ${import.meta.env.VITE_BLOG_NAME}`}</title>
      <div className="space-y-6 w-full max-w-3xl">
        <div className="pl-4 ml-2 space-y-1">
          {tags && tags.length > 0 ? (
            tags.map((tag, index) => (
              <Link
                key={index}
                to={`/?tag=${tag.name}`}
                className="flex items-baseline gap-2 p-2 rounded group w-full text-left bg-transparent border-none cursor-pointer hover:bg-transparent"
                tabIndex={0}
                aria-label={`Filter by tag ${tag.name} with ${tag.post_count} posts`}
              >
                <span className="text-blue-400 group-hover:text-blue-300">
                  &gt;
                </span>
                <span className="text-blue-200 group-hover:text-blue-300 text-base">
                  {tag.name}
                </span>
                <span className="text-blue-500 group-hover:text-blue-300 text-sm">
                  ({tag.post_count})
                </span>
              </Link>
            ))
          ) : (
            <div className="flex items-baseline gap-2 text-[var(--color-text-secondary)]">
              <span className="text-blue-500">&gt;</span>
              <p>No tags found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tags;
