import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  FiLayers,
  FiSearch,
  FiFilter,
  FiEye,
  FiSlash,
  FiCheckCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiMapPin,
  FiUsers,
  FiAlertTriangle,
} from "react-icons/fi";
import { getImageUrl } from "../../utils/imageHelper";
import API_URL from "../../utils/apiConfig";

const AdminWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  // Status toggle modal state
  const [targetWs, setTargetWs] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchWorkspaces = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        if (search.trim()) queryParams.set("search", search.trim());
        if (typeFilter) queryParams.set("type", typeFilter);
        if (approvalFilter) queryParams.set("approvalStatus", approvalFilter);
        if (activeFilter) queryParams.set("isActive", activeFilter);

        const response = await fetch(`${API_URL}/api/admin/workspaces?${queryParams.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load workspaces.");
        }

        setWorkspaces(data.workspaces);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Fetch admin workspaces error:", err);
        setError(err.message || "Could not retrieve workspaces.");
      } finally {
        setLoading(false);
      }
    },
    [search, typeFilter, approvalFilter, activeFilter]
  );

  useEffect(() => {
    fetchWorkspaces(1);
  }, [fetchWorkspaces]);

  // Toggle active status
  const handleToggleActive = async () => {
    if (!targetWs) return;

    try {
      setStatusLoading(true);

      const response = await fetch(`${API_URL}/api/admin/workspaces/${targetWs._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !targetWs.isActive }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update workspace status.");
      }

      setWorkspaces((prev) =>
        prev.map((w) => (w._id === targetWs._id ? { ...w, isActive: !w.isActive } : w))
      );

      setTargetWs(null);
    } catch (err) {
      console.error("Toggle workspace status error:", err);
      alert(err.message || "Could not update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Master Workspace Inventory
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Global directory of all listed workspaces across Nestora with direct moderation and visibility controls.
          </p>
        </div>

        <button
          onClick={() => fetchWorkspaces(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-text-primary hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto disabled:opacity-60"
        >
          <FiRefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by space name, city..."
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>

        {/* Space Type */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="coworking">Coworking Space</option>
            <option value="private-office">Private Office</option>
            <option value="meeting-room">Meeting Room</option>
            <option value="conference-room">Conference Room</option>
          </select>
          <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-text-secondary pointer-events-none" />
        </div>

        {/* Approval Status */}
        <div className="relative">
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition appearance-none cursor-pointer"
          >
            <option value="">All Approval States</option>
            <option value="approved">Approved Listings</option>
            <option value="pending">Pending Moderation</option>
            <option value="rejected">Rejected Listings</option>
          </select>
          <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-text-secondary pointer-events-none" />
        </div>

        {/* Active/Inactive */}
        <div className="relative">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition appearance-none cursor-pointer"
          >
            <option value="">All Visibility States</option>
            <option value="true">Active & Visible</option>
            <option value="false">Deactivated / Inactive</option>
          </select>
          <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchWorkspaces(1)} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Workspaces Master Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-5 py-3.5">Listing</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Host</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Pricing</th>
                <th className="px-4 py-3.5">Moderation</th>
                <th className="px-4 py-3.5">Platform Visibility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-text-secondary">
                    <div className="inline-flex items-center gap-2">
                      <FiRefreshCw className="size-4 animate-spin text-primary" />
                      <span>Loading platform inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-text-secondary">
                    <p className="font-medium">No workspace listings match your filter parameters.</p>
                  </td>
                </tr>
              ) : (
                workspaces.map((ws) => {
                  const firstImg = getImageUrl(ws.images?.[0]);
                  return (
                    <tr key={ws._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Photo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-lg bg-slate-100 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            {firstImg ? (
                              <img
                                src={firstImg}
                                alt={ws.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiMapPin className="size-4 text-text-secondary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text-primary truncate max-w-[200px]">
                              {ws.name}
                            </p>
                            <p className="text-[11px] text-text-secondary truncate">
                              Capacity: {ws.capacity} • {ws.totalUnits || 1} units
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                          {ws.type?.replace("-", " ")}
                        </span>
                      </td>

                      {/* Host */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                        <span className="font-semibold text-text-primary block truncate max-w-[140px]">
                          {ws.owner?.fullName || "Host"}
                        </span>
                        <span className="text-[11px] truncate max-w-[140px] block">
                          {ws.owner?.email}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                        <span className="font-semibold text-text-primary block truncate max-w-[150px]">
                          {ws.address?.city}
                        </span>
                        <span className="text-[11px] truncate max-w-[150px] block">
                          {ws.address?.area}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-text-primary">
                          {ws.pricing?.hourly?.enabled && ws.pricing.hourly.price
                            ? `₹${ws.pricing.hourly.price}/hr`
                            : ws.pricing?.daily?.enabled && ws.pricing.daily.price
                            ? `₹${ws.pricing.daily.price}/day`
                            : "Custom"}
                        </span>
                      </td>

                      {/* Approval Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            ws.approvalStatus === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : ws.approvalStatus === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {ws.approvalStatus}
                        </span>
                      </td>

                      {/* Visibility Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            ws.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              ws.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {ws.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Live platform link */}
                          <Link
                            to={`/workspaces/${ws.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open public workspace listing"
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
                          >
                            <FiExternalLink className="size-3.5" />
                          </Link>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => setTargetWs(ws)}
                            title={ws.isActive ? "Deactivate Listing" : "Activate Listing"}
                            className={`p-1.5 rounded-lg border transition ${
                              ws.isActive
                                ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <FiSlash className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-slate-50/50 text-xs text-text-secondary">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{" "}
              listings
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchWorkspaces(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <FiChevronLeft className="size-4" />
              </button>
              <span className="font-semibold text-text-primary px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchWorkspaces(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <FiChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TOGGLE VISIBILITY MODAL */}
      {targetWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  targetWs.isActive
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <FiAlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {targetWs.isActive ? "Deactivate Workspace" : "Activate Workspace"}
                </h3>
                <p className="text-xs text-text-secondary">{targetWs.name}</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to{" "}
              <strong className="text-text-primary">
                {targetWs.isActive ? "deactivate" : "activate"}
              </strong>{" "}
              this listing?
              {targetWs.isActive
                ? " Deactivating hides the listing from all search results and stops new bookings."
                : " Activating restores this workspace to public visitors and enables bookings."}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTargetWs(null)}
                disabled={statusLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={statusLoading}
                className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition shadow-xs flex items-center gap-2 ${
                  targetWs.isActive
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {statusLoading && <FiRefreshCw className="size-3.5 animate-spin" />}
                <span>{targetWs.isActive ? "Confirm Deactivation" : "Confirm Activation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkspaces;
