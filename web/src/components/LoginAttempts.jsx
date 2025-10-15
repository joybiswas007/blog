import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import api from "@/services/api";

const LoginAttempts = () => {
  const attemptsPerPage = 10;
  const { VITE_BLOG_NAME: blogName } = import.meta.env;
  const [attempts, setAttempts] = useState([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttempts(1);
  }, []);

  const fetchAttempts = async (page = 1) => {
    try {
      setLoading(true);
      const offset = (page - 1) * attemptsPerPage;
      const response = await api.get("/auth/attempts", {
        params: {
          limit: attemptsPerPage,
          offset: offset
        }
      });
      setAttempts(response.data.login_attempts || []);
      setTotalAttempts(response.data.total_count || 0);
      setCurrentPage(page);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch login attempts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttempts(currentPage);
  };

  const formatDateTime = timestamp =>
    timestamp
      ? new Date(timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "—";

  const totalPages = Math.ceil(totalAttempts / attemptsPerPage);

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      fetchAttempts(page);
    }
  };

  const pageTitle = `Login Attempts :: ${blogName}`;

  return (
    <>
      <title>{pageTitle}</title>
      <div className="attempts-container">
        {/* Header */}
        <div className="attempts-header">
          <div>
            <h1 className="attempts-title">Login Attempts</h1>
            <p className="attempts-subtitle">{totalAttempts} total attempts</p>
          </div>
          <div className="attempts-header-actions">
            <button
              onClick={handleRefresh}
              className="attempts-refresh-btn"
              disabled={refreshing}
              type="button"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <Link to="/auth/tools" className="attempts-back-btn">
              <FiArrowLeft />
              <span>Tools</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="attempts-error">{error}</div>}

        {/* Attempts Table */}
        <div className="attempts-table-container">
          {loading ? (
            <div className="attempts-loading">
              <div className="attempts-loading-spinner"></div>
              <p>Loading login attempts...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="attempts-empty">
              <p>No login attempts found</p>
            </div>
          ) : (
            <table className="attempts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>IP Address</th>
                  <th>Last Attempt</th>
                  <th>Attempts</th>
                  <th>Bans</th>
                  <th>Banned Until</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt, index) => (
                  <tr key={attempt.id}>
                    <td className="attempts-index">
                      {(currentPage - 1) * attemptsPerPage + index + 1}
                    </td>
                    <td className="attempts-ip">{attempt.ip}</td>
                    <td>{formatDateTime(attempt.last_attempt)}</td>
                    <td>
                      <span className="attempts-count">{attempt.attempts}</span>
                    </td>
                    <td>
                      <span
                        className={`attempts-badge ${
                          attempt.bans > 0 ? "danger" : "success"
                        }`}
                      >
                        {attempt.bans}
                      </span>
                    </td>
                    <td>
                      {attempt.banned_until ? (
                        <span className="attempts-banned danger">
                          {formatDateTime(attempt.banned_until)}
                        </span>
                      ) : (
                        <span className="attempts-banned success">
                          Not banned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="attempts-pagination">
            <span className="attempts-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <div className="attempts-page-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="attempts-page-btn"
                type="button"
              >
                ←
              </button>
              <span className="attempts-page-current">{currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="attempts-page-btn"
                type="button"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginAttempts;

