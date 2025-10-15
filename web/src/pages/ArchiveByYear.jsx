import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { BsFileText, BsArrowLeft } from "react-icons/bs";
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const getMonthName = dateString => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long"
    });
  };

  // Group posts by month
  const groupPostsByMonth = posts => {
    const grouped = {};
    posts.forEach(post => {
      const month = getMonthName(post.created_at);
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(post);
    });
    return grouped;
  };

  useEffect(() => {
    fetchArchiveByYear();
  }, [fetchArchiveByYear]);

  if (loading) {
    return (
      <div className="posts-loading">
        <div className="posts-loading-spinner"></div>
        <div className="posts-loading-text">Loading {year} posts...</div>
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

  const groupedPosts = posts.length > 0 ? groupPostsByMonth(posts) : {};
  const months = Object.keys(groupedPosts);

  return (
    <>
      <SEO title={`Archives - ${year}`} />
      <div className="archive-year-container">
        <div className="archive-year-header">
          <h1 className="archive-year-title">{year}</h1>
          <span className="archive-year-count">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {posts && posts.length > 0 ? (
          <div className="archive-year-content">
            {months.map((month, monthIndex) => (
              <div key={monthIndex} className="archive-month-section">
                <div className="archive-month-header">
                  <h2 className="archive-month-title">{month}</h2>
                  <span className="archive-month-count">
                    {groupedPosts[month].length}
                  </span>
                </div>
                <div className="archive-month-posts">
                  {groupedPosts[month].map((post, postIndex) => (
                    <Link
                      key={postIndex}
                      to={`/posts/${post.slug}`}
                      className="archive-year-post-item"
                    >
                      <span className="archive-year-post-date">
                        {formatDate(post.created_at)}
                      </span>
                      <BsFileText className="archive-year-post-icon" />
                      <span className="archive-year-post-title">
                        {post.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="archive-year-empty">
            <div className="archive-year-empty-icon">📅</div>
            <h3 className="archive-year-empty-title">No posts found</h3>
            <p className="archive-year-empty-description">
              No posts were published in {year}.
            </p>
          </div>
        )}

        <div className="archive-year-back">
          <Link to="/archives" className="archive-back-button">
            <BsArrowLeft className="archive-back-icon" />
            <span>Back to Archives</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ArchiveByYear;
