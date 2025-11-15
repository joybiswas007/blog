import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import api from "@/services/api";

const Sessions = () => {
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

  const pageTitle = "Sessions :: Joy's Blog";

  return (
    <>
      <title>{pageTitle}</title>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded">
          <div>
            <h1 className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
              Sessions
            </h1>
            <p className="text-xs mt-1 font-mono text-[var(--color-text-secondary)]">
              {totalSessions} total sessions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-sans bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-panel-border)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={refreshing}
              type="button"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              to="/auth/tools"
              className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-sans bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-panel-border)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
            >
              <FiArrowLeft />
              <span>Tools</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded border-l-4 text-sm font-mono bg-[rgba(220,38,38,0.1)] border-l-[#dc2626] text-[#fca5a5]">
            {error}
          </div>
        )}

        {/* Sessions Table */}
        <div className="border border-[var(--color-panel-border)] rounded overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-[3px] border-t-transparent border-[var(--color-accent-primary)] rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-mono text-[var(--color-text-secondary)]">
                Loading sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-mono text-[var(--color-text-secondary)]">
                No sessions found
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse font-mono text-[13px]">
              <thead className="bg-[var(--color-hover-bg)]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider">
                    Started
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider">
                    Ended
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr
                    key={index}
                    className="border-b border-b-[var(--color-panel-border)] transition-colors hover:bg-[var(--color-hover-bg)]"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-accent-primary)]">
                      {session.ip}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      {formatDateTime(session.start_time)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          session.end_time
                            ? "bg-[rgba(248,113,113,0.15)] text-[#f87171] border border-[rgba(248,113,113,0.3)]"
                            : "bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.3)]"
                        }`}
                      >
                        {session.end_time ? "Ended" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      {session.end_time
                        ? formatDateTime(session.end_time)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-t-[var(--color-panel-border)]">
            <span className="text-sm font-mono text-[var(--color-text-secondary)]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded transition-all bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-panel-border)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
              >
                ←
              </button>
              <span className="px-3 py-1 rounded text-sm font-medium font-mono bg-[var(--color-active-bg)] text-[var(--color-text-primary)]">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded transition-all bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-panel-border)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
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
