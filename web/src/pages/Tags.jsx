import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsTag } from "react-icons/bs";
import api from "@/services/api";
import SEO from "@/components/SEO";

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
      <div className="posts-loading">
        <div className="posts-loading-spinner"></div>
        <div className="posts-loading-text">Loading tags...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posts-error">
        <div className="post-error-text">{error}</div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Tags" />
      <div className="tags-container">
        <div className="tags-header">
          <h1 className="tags-header-title">All Tags</h1>
        </div>

        {tags && tags.length > 0 ? (
          <div className="tags-list">
            {tags.map((tag, index) => (
              <Link
                key={index}
                to={`/?tag=${tag.name}`}
                className="tag-item"
                aria-label={`View ${tag.post_count} posts tagged with ${tag.name}`}
              >
                <div className="tag-item-left">
                  <span className="tag-icon">
                    <BsTag />
                  </span>
                  <span className="tag-name">{tag.name}</span>
                </div>
                <span className="tag-count">{tag.post_count}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="tags-empty">
            <div className="tags-empty-icon" aria-hidden="true">
              🏷️
            </div>
            <h2 className="tags-empty-title">No tags found</h2>
            <p className="tags-empty-description">
              Tags will appear here once you create posts with tags.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Tags;
