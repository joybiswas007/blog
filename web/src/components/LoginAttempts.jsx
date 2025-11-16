import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import api from "@/services/api";

const LoginAttempts = () => {
  const attemptsPerPage = 10;
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
      const response = await api.get("/auth/login-attempts", {
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

  const pageTitle = "Login Attempts :: Joy's Blog";

  return (
    <>
      <title>{pageTitle}</title>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded">
          <div>
            <h1 className="text-2xl font-bold font-sans text-[var(--color-text-primary)]">
              Login Attempts
            </h1>
            <p className="text-xs mt-1 font-mono text-[var(--color-text-secondary)]">
              {totalAttempts} total attempts
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
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-sans bg-[var(--color-hover-bg)] text-[var(--color-text-primary)] border border-[var(--color-panel-border)] hover:bg-[var(--color-active-bg)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
            >
              <FiArrowLeft />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded border-l-4 text-sm font-mono bg-[rgba(220,38,38,0.1)] border-l-[#dc2626] text-[#fca5a5]">
            {error}
          </div>
        )}

        {/* Attempts Table */}
        <div className="border border-[var(--color-panel-border)] rounded overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-[3px] border-t-transparent border-[var(--color-accent-primary)] rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-mono text-[var(--color-text-secondary)]">
                Loading login attempts...
              </p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-mono text-[var(--color-text-secondary)]">
                No login attempts found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-[13px]">
                <thead className="bg-[var(--color-hover-bg)]">
                  <tr>
                    <th className="text-left px-3 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider whitespace-nowrap">
                      #
                    </th>
                    <th className="text-left px-3 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider whitespace-nowrap">
                      IP Address
                    </th>
                    <th className="text-left px-3 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider whitespace-nowrap">
                      Last Attempt
                    </th>
                    <th className="text-center px-3 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider whitespace-nowrap">
                      Attempts
                    </th>
                    <th className="text-left px-3 py-3 font-semibold text-xs text-[var(--color-text-secondary)] border-b-2 border-b-[var(--color-panel-border)] uppercase tracking-wider whitespace-nowrap">
                      Banned Until
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt, index) => (
                    <tr
                      key={attempt.id}
                      className="border-b border-b-[var(--color-panel-border)] transition-colors hover:bg-[var(--color-hover-bg)]"
                    >
                      <td className="px-3 py-3 text-[var(--color-text-secondary)]">
                        {(currentPage - 1) * attemptsPerPage + index + 1}
                      </td>
                      <td className="px-3 py-3 font-medium text-[var(--color-accent-primary)]">
                        {attempt.ip}
                      </td>
                      <td className="px-3 py-3 text-[var(--color-text-primary)] whitespace-nowrap">
                        {formatDateTime(attempt.last_attempt)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-[var(--color-active-bg)] text-[var(--color-text-primary)]">
                          {attempt.attempts}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {attempt.banned_until ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-mono bg-[rgba(248,113,113,0.15)] text-[#f87171] border border-[rgba(248,113,113,0.3)]">
                            {formatDateTime(attempt.banned_until)}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs font-mono bg-[rgba(52,211,153,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.3)]">
                            Not banned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-[var(--color-sidebar-bg)] border border-[var(--color-panel-border)] rounded">
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

export default LoginAttempts;
