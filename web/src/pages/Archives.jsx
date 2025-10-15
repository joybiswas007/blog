import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsFire, BsRss, BsFolder2Open, BsFileText } from "react-icons/bs";
import api from "@/services/api";
import SEO from "@/components/SEO";

const Archives = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topPosts, setTopPosts] = useState([]);
  const [topError, setTopError] = useState("");

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/archives");
      setArchives(response.data?.archives || []);
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to fetch archives"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPosts = async () => {
    setTopError("");
    try {
      const response = await api.get("/posts/top-posts");
      setTopPosts(response.data.top_posts || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error;
      setTopError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to fetch top posts"
      );
    }
  };

  useEffect(() => {
    fetchArchives();
    fetchTopPosts();
  }, []);

  if (loading) {
    return (
      <div className="posts-loading">
        <div className="posts-loading-spinner"></div>
        <div className="posts-loading-text">Loading archives...</div>
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
      <SEO title="Archives" />
      <div className="archives-container">
        {/* RSS Feed Section */}
        <section className="archive-section">
          <div className="archive-section-header">
            <BsRss className="archive-section-icon" />
            <h2 className="archive-section-title">RSS Feed</h2>
          </div>
          <div className="archive-section-content">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              to="/rss.xml"
              className="archive-link-item"
            >
              <BsRss className="archive-link-icon" />
              <span className="archive-link-text">/rss.xml</span>
            </Link>
          </div>
        </section>

        {/* Top Posts Section */}
        <section className="archive-section">
          <div className="archive-section-header">
            <BsFire className="archive-section-icon" />
            <h2 className="archive-section-title">Top Posts</h2>
          </div>
          <div className="archive-section-content">
            {topError ? (
              <div className="archive-error">{topError}</div>
            ) : topPosts && topPosts.length > 0 ? (
              <div className="archive-top-posts-list">
                {topPosts.map((topPost, index) => (
                  <Link
                    key={topPost.id}
                    to={`/posts/${topPost.slug}`}
                    className="archive-top-post-item"
                  >
                    <span className="archive-top-post-rank">{index + 1}</span>
                    <BsFileText className="archive-top-post-icon" />
                    <span className="archive-top-post-title">
                      {topPost.title}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="archive-empty-message">
                No top posts available
              </div>
            )}
          </div>
        </section>

        {/* Archives by Year Section */}
        <section className="archive-section">
          <div className="archive-section-header">
            <BsFolder2Open className="archive-section-icon" />
            <h2 className="archive-section-title">By Year</h2>
          </div>
          <div className="archive-section-content">
            {archives && archives.length > 0 ? (
              <div className="archive-years-grid">
                {archives.map((list, index) => (
                  <Link
                    key={index}
                    to={`/archives/${list.year}`}
                    className="archive-year-item"
                  >
                    <BsFolder2Open className="archive-year-icon" />
                    <span className="archive-year-text">{list.year}</span>
                    <span className="archive-year-count">
                      {list.post_count}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="archive-empty-message">No archives found</div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Archives;
