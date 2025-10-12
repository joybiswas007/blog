import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";

const Sessions = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch sessions history");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = timestamp => {
    if (!timestamp) return "Active";
    return new Date(timestamp).toLocaleString();
  };

  const getSessionStatus = endTime => {
    return endTime ? "Ended" : "Active";
  };

  const totalPages = Math.ceil(totalSessions / sessionsPerPage);

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      fetchSessions(page);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageTitle = `Sessions :: ${blogName}`;

  return (
    <div className="flex justify-center w-full">
      <title>{pageTitle}</title>
      <div className="w-full max-w-3xl px-4 py-4 space-y-8">
        {/* Header with Back to Tools Link */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading text-blue-300">Sessions</h1>
            <p className="text-[var(--color-text-secondary)] font-mono text-sm mt-1">
              Total: {totalSessions} sessions
            </p>
          </div>
          <Link
            to="/auth/tools"
            className="inline-flex items-center px-4 py-2 text-sm font-mono font-medium text-[var(--color-text-secondary)] hover:text-blue-400 transition-colors duration-200"
          >
            <span className="text-blue-500 mr-2 text-lg">←</span>
            Back to Tools
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-blue-500/10 text-blue-400 font-mono border border-blue-500/30 mb-4">
            {error}
          </div>
        )}

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-background-primary)] border border-[var(--color-border-primary)] rounded-lg font-mono text-sm">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  IP Address
                </th>
                <th className="py-2 px-3 text-left text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  Started
                </th>
                <th className="py-2 px-3 text-left text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  Status
                </th>
                <th className="py-2 px-3 text-left text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  Ended
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-blue-400 font-heading"
                  >
                    Loading sessions…
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-[var(--color-text-secondary)]"
                  >
                    No sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((session, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--color-border-primary)] hover:bg-blue-900/20 transition-colors"
                  >
                    <td className="py-2 px-3 text-blue-400">{session.ip}</td>
                    <td className="py-2 px-3 text-[var(--color-text-primary)]">
                      {formatDateTime(session.start_time)}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-mono ${
                          session.end_time
                            ? "bg-red-900/30 text-red-400 border border-red-800/50"
                            : "bg-green-900/30 text-green-400 border border-green-800/50"
                        }`}
                      >
                        {getSessionStatus(session.end_time)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[var(--color-text-primary)]">
                      {session.end_time
                        ? formatDateTime(session.end_time)
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-[var(--color-text-secondary)] font-mono text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-blue-900/20 hover:bg-blue-900/30 disabled:bg-blue-950/20 text-blue-400 hover:text-blue-300 disabled:text-blue-600 border border-blue-800 hover:border-blue-700 disabled:border-blue-900 rounded-lg transition-colors font-mono text-sm disabled:cursor-not-allowed"
              >
                ←
              </button>
              {/* Page Numbers */}
              {generatePageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={index}
                    className="px-3 py-2 text-[var(--color-text-secondary)] font-mono text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-lg transition-colors font-mono text-sm ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 hover:text-blue-300 border-blue-800 hover:border-blue-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-blue-900/20 hover:bg-blue-900/30 disabled:bg-blue-950/20 text-blue-400 hover:text-blue-300 disabled:text-blue-600 border border-blue-800 hover:border-blue-700 disabled:border-blue-900 rounded-lg transition-colors font-mono text-sm disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => fetchSessions(currentPage)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-mono text-sm"
          >
            Refresh Sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
