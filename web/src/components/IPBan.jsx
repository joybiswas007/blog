import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";

const IPBan = () => {
  const { VITE_BLOG_NAME: blogName } = import.meta.env;

  const [ipBans, setIpBans] = useState([]);
  const [totalBans, setTotalBans] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    }
  };

  const handleUnban = async banId => {
    setError("");
    try {
      await api.post(`/auth/ip/unban/${banId}`);
      fetchIPBans(currentPage);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to unban IP");
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
    <div className="flex justify-center w-full">
      <title>{pageTitle}</title>
      <div className="space-y-8 w-full max-w-3xl px-4 py-4">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading text-blue-300">
            IP Ban Management
          </h1>
          <Link
            to="/auth/tools"
            className="inline-flex items-center gap-2 font-mono text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="text-blue-500 text-lg">←</span>
            <span>Back to Tools</span>
          </Link>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-lg bg-blue-500/10 text-blue-400 font-mono border border-blue-500/30">
            {error}
          </div>
        )}

        {/* Search & Create Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-end mb-2">
          <div className="flex-1">
            <label className="block text-sm font-mono text-[var(--color-text-secondary)] mb-1">
              Search IP
            </label>
            <input
              type="text"
              value={searchIP}
              onChange={e => setSearchIP(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-background-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-blue-500"
              placeholder="IP range, eg. 192.168.1"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-mono text-[var(--color-text-secondary)] mb-1">
              Search Reason
            </label>
            <input
              type="text"
              value={searchReason}
              onChange={e => setSearchReason(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-background-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-blue-500"
              placeholder="Reason for ban"
            />
          </div>
          <button
            onClick={() => fetchIPBans(currentPage)}
            className="px-4 py-2 rounded-lg font-mono bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-4 py-2 rounded-lg font-mono bg-green-600 hover:bg-green-700 text-white font-bold transition-colors ${showCreateForm ? "bg-red-600 hover:bg-red-700" : ""}`}
          >
            {showCreateForm ? "Close" : "New Ban"}
          </button>
        </div>

        {/* Create Form - stays inside the box! */}
        {showCreateForm && (
          <div className="p-6 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-background-primary)] shadow mb-2">
            <h2 className="font-heading text-xl text-blue-300 mb-4">
              Add New IP Ban
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-mono text-[var(--color-text-secondary)] mb-1">
                  From IP
                </label>
                <input
                  type="text"
                  value={fromIP}
                  onChange={e => setFromIP(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-background-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 192.168.1.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-[var(--color-text-secondary)] mb-1">
                  To IP
                </label>
                <input
                  type="text"
                  value={toIP}
                  onChange={e => setToIP(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-background-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 192.168.1.254"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-[var(--color-text-secondary)] mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-background-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-blue-500"
                  placeholder="Reason for ban"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCreateBan}
                disabled={!fromIP.trim() || !toIP.trim() || !reason.trim()}
                className="px-6 py-2 rounded-lg font-mono bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:bg-blue-400"
              >
                Submit
              </button>
              <button
                onClick={handleClearBanForm}
                type="button"
                className="px-6 py-2 rounded-lg font-mono bg-yellow-600 hover:bg-yellow-700 text-white font-bold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-[var(--color-text-secondary)] font-mono">
            Showing {filteredBans.length} / {totalBans} bans • Page{" "}
            {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchIPBans(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg font-mono bg-blue-900 text-blue-300 font-bold disabled:bg-gray-800 disabled:text-gray-500"
            >
              First
            </button>
            <button
              onClick={() => fetchIPBans(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg font-mono bg-blue-900 text-blue-300 font-bold disabled:bg-gray-800 disabled:text-gray-500"
            >
              Prev
            </button>
            <button
              onClick={() => fetchIPBans(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg font-mono bg-blue-900 text-blue-300 font-bold disabled:bg-gray-800 disabled:text-gray-500"
            >
              Next
            </button>
            <button
              onClick={() => fetchIPBans(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg font-mono bg-blue-900 text-blue-300 font-bold disabled:bg-gray-800 disabled:text-gray-500"
            >
              Last
            </button>
          </div>
        </div>

        {/* IP Bans Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-background-primary)] border border-[var(--color-border-primary)] rounded-lg font-mono text-sm">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  IP From
                </th>
                <th className="py-2 px-3 text-left text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  IP To
                </th>
                <th className="py-2 px-3 text-left text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  Reason
                </th>
                <th className="py-2 px-3 text-center text-xs text-blue-300 font-heading border-b border-[var(--color-border-primary)]">
                  Action
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
                    Loading IP bans…
                  </td>
                </tr>
              ) : filteredBans.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-[var(--color-text-secondary)]"
                  >
                    No IP bans found.
                  </td>
                </tr>
              ) : (
                filteredBans.map((ban, idx) => (
                  <tr
                    key={ban.id || idx}
                    className="border-b border-[var(--color-border-primary)] hover:bg-blue-900/20 transition-colors"
                  >
                    <td className="py-2 px-3 text-blue-400">{ban.from_ip}</td>
                    <td className="py-2 px-3 text-blue-400">{ban.to_ip}</td>
                    <td className="py-2 px-3 text-[var(--color-text-primary)]">
                      {ban.reason}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleUnban(ban.id)}
                        className="px-4 py-2 rounded-lg font-mono bg-red-600 hover:bg-red-700 text-white font-bold transition-colors text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IPBan;
