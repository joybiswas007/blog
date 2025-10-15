import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiRefreshCw,
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiX
} from "react-icons/fi";
import api from "@/services/api";

const IPBan = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;

  const [ipBans, setIpBans] = useState([]);
  const [totalBans, setTotalBans] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchIP, setSearchIP] = useState("");
  const [searchReason, setSearchReason] = useState("");
  const [fromIP, setFromIP] = useState("");
  const [toIP, setToIP] = useState("");
  const [reason, setReason] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const bansPerPage = 20;

  useEffect(() => {
    fetchIPBans(1);
  }, []);

  const fetchIPBans = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const offset = (page - 1) * bansPerPage;
      const response = await api.get("/auth/ip/bans-list", {
        params: { limit: bansPerPage, offset }
      });
      setIpBans(response.data.lists || []);
      setTotalBans(response.data.total_count || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch IP bans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchIPBans(currentPage);
  };

  const handleUnban = async banId => {
    if (window.confirm("Are you sure you want to remove this IP ban?")) {
      setError("");
      try {
        await api.post(`/auth/ip/unban/${banId}`);
        fetchIPBans(currentPage);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to unban IP");
      }
    }
  };

  const handleCreateBan = async () => {
    if (!fromIP.trim() || !toIP.trim() || !reason.trim()) {
      setError("All fields are required");
      return;
    }
    setError("");
    try {
      await api.post("/auth/ip/ban", {
        from_ip: fromIP.trim(),
        to_ip: toIP.trim(),
        reason: reason.trim()
      });
      setFromIP("");
      setToIP("");
      setReason("");
      setShowCreateForm(false);
      fetchIPBans(currentPage);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create IP ban");
    }
  };

  const handleClearBanForm = () => {
    setFromIP("");
    setToIP("");
    setReason("");
    setError("");
  };

  const totalPages = Math.ceil(totalBans / bansPerPage);

  const filteredBans = ipBans.filter(
    ban =>
      (!searchIP ||
        ban.from_ip.includes(searchIP) ||
        ban.to_ip.includes(searchIP)) &&
      (!searchReason ||
        ban.reason?.toLowerCase().includes(searchReason.toLowerCase()))
  );

  const pageTitle = `IP Bans :: ${blogName}`;

  return (
    <>
      <title>{pageTitle}</title>
      <div className="ipban-container">
        {/* Header */}
        <div className="ipban-header">
          <div>
            <h1 className="ipban-title">IP Ban Management</h1>
            <p className="ipban-subtitle">{totalBans} total bans</p>
          </div>
          <div className="ipban-header-actions">
            <button
              onClick={handleRefresh}
              className="ipban-refresh-btn"
              disabled={refreshing}
              type="button"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`ipban-create-btn ${showCreateForm ? "active" : ""}`}
              type="button"
            >
              {showCreateForm ? <FiX /> : <FiPlus />}
              <span>{showCreateForm ? "Cancel" : "New Ban"}</span>
            </button>
            <Link to="/auth/tools" className="ipban-back-btn">
              <FiArrowLeft />
              <span>Tools</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="ipban-error">{error}</div>}

        {/* Create Form */}
        {showCreateForm && (
          <div className="ipban-form">
            <h2 className="ipban-form-title">Add New IP Ban</h2>
            <div className="ipban-form-grid">
              <div className="ipban-form-field">
                <label className="ipban-form-label">From IP</label>
                <input
                  type="text"
                  value={fromIP}
                  onChange={e => setFromIP(e.target.value)}
                  className="ipban-form-input"
                  placeholder="192.168.1.1"
                  required
                />
              </div>
              <div className="ipban-form-field">
                <label className="ipban-form-label">To IP</label>
                <input
                  type="text"
                  value={toIP}
                  onChange={e => setToIP(e.target.value)}
                  className="ipban-form-input"
                  placeholder="192.168.1.254"
                  required
                />
              </div>
              <div className="ipban-form-field">
                <label className="ipban-form-label">
                  Reason <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="ipban-form-input"
                  placeholder="Reason for ban"
                  required
                />
              </div>
            </div>
            <div className="ipban-form-actions">
              <button
                onClick={handleCreateBan}
                disabled={!fromIP.trim() || !toIP.trim() || !reason.trim()}
                className="ipban-form-submit"
                type="button"
              >
                <FiPlus />
                <span>Create Ban</span>
              </button>
              <button
                onClick={handleClearBanForm}
                className="ipban-form-clear"
                type="button"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Search Filters */}
        <div className="ipban-filters">
          <div className="ipban-filter-field">
            <label className="ipban-filter-label">Search IP</label>
            <input
              type="text"
              value={searchIP}
              onChange={e => setSearchIP(e.target.value)}
              className="ipban-filter-input"
              placeholder="192.168.1"
            />
          </div>
          <div className="ipban-filter-field">
            <label className="ipban-filter-label">Search Reason</label>
            <input
              type="text"
              value={searchReason}
              onChange={e => setSearchReason(e.target.value)}
              className="ipban-filter-input"
              placeholder="Search reason..."
            />
          </div>
          <div className="ipban-filter-info">
            {filteredBans.length !== totalBans && (
              <span>
                Showing {filteredBans.length} of {totalBans} bans
              </span>
            )}
          </div>
        </div>

        {/* IP Bans Table */}
        <div className="ipban-table-container">
          {loading ? (
            <div className="ipban-loading">
              <div className="ipban-loading-spinner"></div>
              <p>Loading IP bans...</p>
            </div>
          ) : filteredBans.length === 0 ? (
            <div className="ipban-empty">
              <p>No IP bans found</p>
            </div>
          ) : (
            <table className="ipban-table">
              <thead>
                <tr>
                  <th>From IP</th>
                  <th>To IP</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBans.map((ban, idx) => (
                  <tr key={ban.id || idx}>
                    <td className="ipban-ip">{ban.from_ip}</td>
                    <td className="ipban-ip">{ban.to_ip}</td>
                    <td>{ban.reason}</td>
                    <td>
                      <button
                        onClick={() => handleUnban(ban.id)}
                        className="ipban-delete-btn"
                        title="Delete ban"
                        type="button"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ipban-pagination">
            <span className="ipban-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <div className="ipban-page-controls">
              <button
                onClick={() => fetchIPBans(1)}
                disabled={currentPage === 1}
                className="ipban-page-btn"
                type="button"
              >
                First
              </button>
              <button
                onClick={() => fetchIPBans(currentPage - 1)}
                disabled={currentPage === 1}
                className="ipban-page-btn"
                type="button"
              >
                ←
              </button>
              <span className="ipban-page-current">{currentPage}</span>
              <button
                onClick={() => fetchIPBans(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ipban-page-btn"
                type="button"
              >
                →
              </button>
              <button
                onClick={() => fetchIPBans(totalPages)}
                disabled={currentPage === totalPages}
                className="ipban-page-btn"
                type="button"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IPBan;
