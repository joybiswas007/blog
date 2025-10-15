import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import api from "@/services/api";

const Sessions = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const sessionsPerPage = 10;

  useEffect(() => {
    fetchSessions(1);
  }, []);

  const fetchSessions = async (page = 1) => {
    try {
      setLoading(true);
      const offset = (page - 1) * sessionsPerPage;
      const response = await api.get("/auth/sessions", {
        params: {
          limit: sessionsPerPage,
          offset: offset
        }
      });
      setSessions(response.data.sessions.history || []);
      setTotalSessions(response.data.sessions.total_count || 0);
      setCurrentPage(page);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch sessions history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessions(currentPage);
  };

  const formatDateTime = timestamp => {
    if (!timestamp) return "Active";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const totalPages = Math.ceil(totalSessions / sessionsPerPage);

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      fetchSessions(page);
    }
  };

  const pageTitle = `Sessions :: ${blogName}`;

  return (
    <>
      <title>{pageTitle}</title>
      <div className="sessions-container">
        {/* Header */}
        <div className="sessions-header">
          <div>
            <h1 className="sessions-title">Sessions</h1>
            <p className="sessions-subtitle">{totalSessions} total sessions</p>
          </div>
          <div className="sessions-header-actions">
            <button
              onClick={handleRefresh}
              className="sessions-refresh-btn"
              disabled={refreshing}
              type="button"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <Link to="/auth/tools" className="sessions-back-btn">
              <FiArrowLeft />
              <span>Tools</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="sessions-error">
            {error}
          </div>
        )}

        {/* Sessions Table */}
        <div className="sessions-table-container">
          {loading ? (
            <div className="sessions-loading">
              <div className="sessions-loading-spinner"></div>
              <p>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="sessions-empty">
              <p>No sessions found</p>
            </div>
          ) : (
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Started</th>
                  <th>Status</th>
                  <th>Ended</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index}>
                    <td className="sessions-ip">{session.ip}</td>
                    <td>{formatDateTime(session.start_time)}</td>
                    <td>
                      <span
                        className={`sessions-status ${
                          session.end_time ? "ended" : "active"
                        }`}
                      >
                        {session.end_time ? "Ended" : "Active"}
                      </span>
                    </td>
                    <td>
                      {session.end_time ? formatDateTime(session.end_time) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="sessions-pagination">
            <span className="sessions-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <div className="sessions-page-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="sessions-page-btn"
                type="button"
              >
                ←
              </button>
              <span className="sessions-page-current">{currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="sessions-page-btn"
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

export default Sessions;

