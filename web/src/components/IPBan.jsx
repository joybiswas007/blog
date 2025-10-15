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
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#21252b] border border-[#2c313a] rounded">
          <div>
            <h1 className="text-2xl font-bold font-sans text-[#abb2bf]">
              IP Ban Management
            </h1>
            <p className="text-xs mt-1 font-mono text-[#5c6370]">
              {totalBans} total bans
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={refreshing}
              type="button"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-sans border ${
                showCreateForm
                  ? "bg-[rgba(224,108,117,0.2)] border-[#e06c75] text-[#e06c75] hover:bg-[rgba(224,108,117,0.3)]"
                  : "bg-[#61afef] text-[#21252b] border-[#61afef] hover:bg-[#84c0f4] hover:border-[#84c0f4]"
              }`}
              type="button"
            >
              {showCreateForm ? <FiX /> : <FiPlus />}
              <span>{showCreateForm ? "Cancel" : "New Ban"}</span>
            </button>
            <Link
              to="/auth/tools"
              className="inline-flex items-center gap-2 px-4 py-2 rounded no-underline transition-all text-sm font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef]"
            >
              <FiArrowLeft />
              <span>Tools</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded-l-none text-sm font-mono bg-[rgba(224,108,117,0.1)] border-l-4 border-l-[#e06c75] text-[#e06c75]">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="p-6 rounded bg-[#21252b] border border-[#2c313a]">
            <h2 className="text-lg font-semibold mb-4 font-sans text-[#abb2bf]">
              Add New IP Ban
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium font-sans text-[#5c6370] uppercase tracking-wider">
                  From IP
                </label>
                <input
                  type="text"
                  value={fromIP}
                  onChange={e => setFromIP(e.target.value)}
                  className="px-3 py-2 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-colors focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
                  placeholder="192.168.1.1"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium font-sans text-[#5c6370] uppercase tracking-wider">
                  To IP
                </label>
                <input
                  type="text"
                  value={toIP}
                  onChange={e => setToIP(e.target.value)}
                  className="px-3 py-2 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-colors focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
                  placeholder="192.168.1.254"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium font-sans text-[#5c6370] uppercase tracking-wider">
                  Reason <span className="text-[#e06c75]">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="px-3 py-2 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-colors focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
                  placeholder="Reason for ban"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateBan}
                disabled={!fromIP.trim() || !toIP.trim() || !reason.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans bg-[#61afef] text-[#21252b] border border-[#61afef] hover:bg-[#84c0f4] hover:border-[#84c0f4] disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <FiPlus />
                <span>Create Ban</span>
              </button>
              <button
                onClick={handleClearBanForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded transition-all text-sm font-medium font-sans bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef]"
                type="button"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Search Filters */}
        <div className="flex flex-wrap items-end gap-4 p-4 bg-[#21252b] border border-[#2c313a] rounded">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium font-sans text-[#5c6370] uppercase tracking-wider">
              Search IP
            </label>
            <input
              type="text"
              value={searchIP}
              onChange={e => setSearchIP(e.target.value)}
              className="px-3 py-2 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-colors focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
              placeholder="192.168.1"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium font-sans text-[#5c6370] uppercase tracking-wider">
              Search Reason
            </label>
            <input
              type="text"
              value={searchReason}
              onChange={e => setSearchReason(e.target.value)}
              className="px-3 py-2 rounded text-sm font-mono bg-[#1e2127] text-[#abb2bf] border border-[#3e4451] transition-colors focus:outline-none focus:border-[#61afef] focus:ring-1 focus:ring-[#61afef] placeholder:text-[#4b5263]"
              placeholder="Search reason..."
            />
          </div>
          <div className="text-xs font-mono text-[#5c6370]">
            {filteredBans.length !== totalBans && (
              <span>
                Showing {filteredBans.length} of {totalBans} bans
              </span>
            )}
          </div>
        </div>

        {/* IP Bans Table */}
        <div className="border border-[#2c313a] rounded overflow-x-auto bg-[#21252b]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-[3px] border-t-transparent border-[#61afef] rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-mono text-[#5c6370]">
                Loading IP bans...
              </p>
            </div>
          ) : filteredBans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-mono text-[#5c6370]">
                No IP bans found
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse font-mono text-[13px]">
              <thead className="bg-[#282c34]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-[#5c6370] border-b-2 border-b-[#2c313a] uppercase tracking-wider whitespace-nowrap">
                    From IP
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-[#5c6370] border-b-2 border-b-[#2c313a] uppercase tracking-wider whitespace-nowrap">
                    To IP
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-[#5c6370] border-b-2 border-b-[#2c313a] uppercase tracking-wider whitespace-nowrap">
                    Reason
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-xs text-[#5c6370] border-b-2 border-b-[#2c313a] uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBans.map((ban, idx) => (
                  <tr
                    key={ban.id || idx}
                    className="border-b border-b-[#282c34] transition-colors hover:bg-[#2c313a]"
                  >
                    <td className="px-4 py-3 font-medium text-[#61afef]">
                      {ban.from_ip}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#61afef]">
                      {ban.to_ip}
                    </td>
                    <td className="px-4 py-3 text-[#abb2bf]">{ban.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleUnban(ban.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded transition-all bg-transparent text-[#5c6370] border border-transparent hover:bg-[rgba(224,108,117,0.1)] hover:text-[#e06c75] hover:border-[#e06c75]"
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
          <div className="flex items-center justify-between p-4 border-t border-t-[#2c313a]">
            <span className="text-sm font-mono text-[#5c6370]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchIPBans(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded transition-all text-sm font-mono bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
              >
                First
              </button>
              <button
                onClick={() => fetchIPBans(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded transition-all text-sm font-mono bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
              >
                ←
              </button>
              <span className="px-3 py-1 rounded text-sm font-medium font-mono bg-[#353b45] text-[#abb2bf]">
                {currentPage}
              </span>
              <button
                onClick={() => fetchIPBans(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded transition-all text-sm font-mono bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] disabled:opacity-30 disabled:cursor-not-allowed"
                type="button"
              >
                →
              </button>
              <button
                onClick={() => fetchIPBans(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded transition-all text-sm font-mono bg-[#2c313a] text-[#abb2bf] border border-[#353b45] hover:bg-[#353b45] hover:border-[#61afef] hover:text-[#61afef] disabled:opacity-30 disabled:cursor-not-allowed"
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
