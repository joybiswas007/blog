import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sessionsPerPage = 10;

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

  useEffect(() => {
    fetchSessions(1);
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center w-full min-h-screen bg-[var(--color-background-primary)]">
        <div className="w-full max-w-3xl px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl text-blue-300 font-heading">Sessions</h1>
            <Link
              to="/auth/tools"
              className="px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-700 rounded-lg transition-colors font-mono text-sm"
            >
              ← Back to Tools
            </Link>
          </div>
          <div className="text-center text-[var(--color-text-secondary)] font-mono">
            Loading sessions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full min-h-screen bg-[var(--color-background-primary)]">
      <div className="w-full max-w-3xl px-4 py-6">
        {/* Header with Back to Tools Link */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-blue-300 font-heading">Sessions</h1>
            <p className="text-[var(--color-text-secondary)] font-mono text-sm mt-1">
              Total: {totalSessions} sessions
            </p>
          </div>
          <Link
            to="/auth/tools"
            className="px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-700 rounded-lg transition-colors font-mono text-sm"
          >
            ← Back to Tools
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)] font-mono text-lg">
              No sessions found
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {sessions &&
                sessions.map((session, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg hover:bg-blue-900/30 hover:border-blue-700 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* <div> */}
                      {/*   <span className="text-[var(--color-text-secondary)] text-xs font-mono uppercase tracking-wide"> */}
                      {/*     User ID */}
                      {/*   </span> */}
                      {/*   <p className="text-blue-400 font-mono text-sm mt-1"> */}
                      {/*     {session.user_id} */}
                      {/* </p> */}
                      {/* </div> */}

                      {/* IP Address */}
                      <div>
                        <span className="text-[var(--color-text-secondary)] text-xs font-mono uppercase tracking-wide">
                          IP Address
                        </span>
                        <p className="text-blue-400 font-mono text-sm mt-1">
                          {session.ip}
                        </p>
                      </div>

                      {/* Start Time */}
                      <div>
                        <span className="text-[var(--color-text-secondary)] text-xs font-mono uppercase tracking-wide">
                          Started
                        </span>
                        <p className="text-[var(--color-text-primary)] font-mono text-sm mt-1">
                          {formatDateTime(session.start_time)}
                        </p>
                      </div>

                      {/* Status & End Time */}
                      <div>
                        <span className="text-[var(--color-text-secondary)] text-xs font-mono uppercase tracking-wide">
                          Status
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-mono ${
                              session.end_time
                                ? "bg-red-900/30 text-red-400 border border-red-800/50"
                                : "bg-green-900/30 text-green-400 border border-green-800/50"
                            }`}
                          >
                            {getSessionStatus(session.end_time)}
                          </span>
                          {session.end_time && (
                            <p className="text-[var(--color-text-primary)] font-mono text-xs mt-1">
                              Ended: {formatDateTime(session.end_time)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
          </>
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
