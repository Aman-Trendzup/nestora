import { useState, useEffect, useCallback } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiInfo,
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";
import { getImageUrl } from "../../utils/imageHelper";
import API_URL from "../../utils/apiConfig";

const AdminApprovals = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusTab, setStatusTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modal Inspector State
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reject Dialog State
  const [rejectModalWs, setRejectModalWs] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch workspaces based on approval tab
  const fetchWorkspaces = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        if (statusTab) queryParams.set("approvalStatus", statusTab);
        if (search.trim()) queryParams.set("search", search.trim());
        if (typeFilter) queryParams.set("type", typeFilter);

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
        console.error("Fetch workspaces error:", err);
        setError(err.message || "Could not retrieve listings.");
      } finally {
        setLoading(false);
      }
    },
    [statusTab, search, typeFilter]
  );

  useEffect(() => {
    fetchWorkspaces(1);
  }, [fetchWorkspaces]);

  // Handle Approve or Reject
  const handleApprovalAction = async (workspaceId, approvalStatus, reason = "") => {
    try {
      setActionLoading(true);

      const response = await fetch(`${API_URL}/api/admin/workspaces/${workspaceId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          approvalStatus,
          rejectionReason: reason,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update listing status.");
      }

      // Refresh list
      fetchWorkspaces(pagination.page);

      // Close modals
      setSelectedWorkspace(null);
      setRejectModalWs(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Approval action error:", err);
      alert(err.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Workspace Listing Approvals
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Inspect, approve, or reject workspace listings submitted by space hosts before public publication.
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

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
        {[
          { label: "Pending Approvals", value: "pending", icon: FiClock },
          { label: "Approved Listings", value: "approved", icon: FiCheckCircle },
          { label: "Rejected Submissions", value: "rejected", icon: FiXCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatusTab(tab.value);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
                statusTab === tab.value
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by space name, city, area..."
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>

        {/* Space Type Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition appearance-none cursor-pointer"
            >
              <option value="">All Space Types</option>
              <option value="coworking">Coworking Space</option>
              <option value="private-office">Private Office</option>
              <option value="meeting-room">Meeting Room</option>
              <option value="conference-room">Conference Room</option>
            </select>
            <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-text-secondary pointer-events-none" />
          </div>
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

      {/* Listings Table / Queue */}
      <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-5 py-3.5">Workspace</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Capacity</th>
                <th className="px-4 py-3.5">Pricing</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Host</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-text-secondary">
                    <div className="inline-flex items-center gap-2">
                      <FiRefreshCw className="size-4 animate-spin text-primary" />
                      <span>Loading listings queue...</span>
                    </div>
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-text-secondary">
                    <p className="font-medium">No {statusTab} workspace listings found.</p>
                    <p className="text-[11px] text-text-secondary/80 mt-1">
                      {statusTab === "pending"
                        ? "Great! All submitted spaces have been reviewed."
                        : "No records match your filters."}
                    </p>
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
                              Added {new Date(ws.createdAt).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                          {ws.type?.replace("-", " ")}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                        <span className="font-semibold text-text-primary">{ws.capacity}</span> guests
                        {ws.totalUnits > 1 && (
                          <span className="text-[11px] text-text-secondary block">
                            {ws.totalUnits} units
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-text-primary font-bold">
                          {ws.pricing?.hourly?.enabled && ws.pricing.hourly.price
                            ? `₹${ws.pricing.hourly.price}/hr`
                            : ws.pricing?.daily?.enabled && ws.pricing.daily.price
                            ? `₹${ws.pricing.daily.price}/day`
                            : "Custom"}
                        </div>
                        <span className="text-[10px] text-text-secondary uppercase">
                          {ws.pricing?.pricingType?.replace("_", " ")}
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

                      {/* Host */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                        <span className="font-semibold text-text-primary block truncate max-w-[140px]">
                          {ws.owner?.fullName || "Host"}
                        </span>
                        <span className="text-[11px] truncate max-w-[140px] block">
                          {ws.owner?.email}
                        </span>
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Review Details Button */}
                          <button
                            onClick={() => {
                              setSelectedWorkspace(ws);
                              setActiveImageIdx(0);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-text-primary hover:bg-slate-100 transition text-xs font-semibold"
                          >
                            <FiEye className="size-3.5" />
                            <span>Review</span>
                          </button>

                          {/* Quick Approve (If not already approved) */}
                          {ws.approvalStatus !== "approved" && (
                            <button
                              onClick={() => handleApprovalAction(ws._id, "approved")}
                              title="Approve Listing"
                              className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              <FiCheckCircle className="size-4" />
                            </button>
                          )}

                          {/* Quick Reject (If not already rejected) */}
                          {ws.approvalStatus !== "rejected" && (
                            <button
                              onClick={() => {
                                setRejectModalWs(ws);
                                setRejectionReason("");
                              }}
                              title="Reject Listing"
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                            >
                              <FiXCircle className="size-4" />
                            </button>
                          )}
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

      {/* FULL WORKSPACE INSPECTION MODAL */}
      {selectedWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Listing Moderation Review
                </span>
                <h2 className="text-lg font-bold text-text-primary">
                  {selectedWorkspace.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
              >
                <FiX className="size-5" />
              </button>
            </div>

            {/* Images Gallery */}
            {selectedWorkspace.images?.length > 0 ? (
              <div className="space-y-3">
                <div className="relative h-60 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-900 border border-border">
                  <img
                    src={getImageUrl(selectedWorkspace.images[activeImageIdx])}
                    alt={selectedWorkspace.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md font-semibold">
                    {activeImageIdx + 1} / {selectedWorkspace.images.length}
                  </div>
                </div>

                {/* Thumbnails row */}
                {selectedWorkspace.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {selectedWorkspace.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`size-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                          activeImageIdx === idx ? "border-primary" : "border-transparent opacity-70"
                        }`}
                      >
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-border text-xs text-text-secondary">
                No photos uploaded for this workspace listing.
              </div>
            )}

            {/* Rejection notice if previously rejected */}
            {selectedWorkspace.approvalStatus === "rejected" && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <FiAlertCircle className="size-4 text-rose-600" />
                  Currently Rejected
                </span>
                <p>
                  Reason: {selectedWorkspace.rejectionReason || "Listing did not meet guidelines."}
                </p>
              </div>
            )}

            {/* Core Info Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-secondary block">Space Type</span>
                <span className="font-bold text-text-primary capitalize">
                  {selectedWorkspace.type?.replace("-", " ")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-secondary block">Total Capacity</span>
                <span className="font-bold text-text-primary">
                  {selectedWorkspace.capacity} Persons
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-secondary block">Bookable Units</span>
                <span className="font-bold text-text-primary">
                  {selectedWorkspace.totalUnits || 1} Space(s)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-text-secondary block">Floor Area</span>
                <span className="font-bold text-text-primary">
                  {selectedWorkspace.areaSqFt ? `${selectedWorkspace.areaSqFt} sq.ft` : "Not provided"}
                </span>
              </div>
            </div>

            {/* Pricing Matrix */}
            <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-text-secondary block text-[11px]">
                Pricing Architecture ({selectedWorkspace.pricing?.pricingType?.replace("_", " ")})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-text-secondary">Hourly Rate:</span>
                  <span className="font-bold text-text-primary">
                    {selectedWorkspace.pricing?.hourly?.enabled
                      ? `₹${selectedWorkspace.pricing.hourly.price} / hr`
                      : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-text-secondary">Full-Day Rate:</span>
                  <span className="font-bold text-text-primary">
                    {selectedWorkspace.pricing?.daily?.enabled
                      ? `₹${selectedWorkspace.pricing.daily.price} / day`
                      : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Address */}
            <div className="p-4 rounded-xl bg-slate-50 border border-border text-xs space-y-1">
              <span className="font-bold uppercase tracking-wider text-text-secondary block text-[11px]">
                Full Location
              </span>
              <p className="font-semibold text-text-primary">
                {selectedWorkspace.address?.fullAddress}
              </p>
              <p className="text-text-secondary">
                {selectedWorkspace.address?.area}, {selectedWorkspace.address?.city},{" "}
                {selectedWorkspace.address?.state} - {selectedWorkspace.address?.postalCode}
              </p>
              {selectedWorkspace.address?.landmark && (
                <p className="text-[11px] text-text-secondary">
                  Landmark: {selectedWorkspace.address.landmark}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="text-xs space-y-1">
              <span className="font-bold uppercase tracking-wider text-text-secondary block text-[11px]">
                Description
              </span>
              <p className="text-text-primary leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-border">
                {selectedWorkspace.description}
              </p>
            </div>

            {/* Amenities & Features */}
            {(selectedWorkspace.amenities?.length > 0 || selectedWorkspace.features?.length > 0) && (
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-text-secondary block text-[11px]">
                  Amenities & Facilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[...(selectedWorkspace.amenities || []), ...(selectedWorkspace.features || [])].map(
                    (tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-text-primary text-[11px] font-medium"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Host Details */}
            <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Listing Submitted By Host
                </span>
                <p className="text-sm font-bold mt-0.5">{selectedWorkspace.owner?.fullName}</p>
                <p className="text-slate-300 text-[11px]">
                  {selectedWorkspace.owner?.email} • {selectedWorkspace.owner?.phone || "No phone"}
                </p>
              </div>
              {selectedWorkspace.owner?.businessName && (
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Business</span>
                  <p className="text-xs font-semibold">{selectedWorkspace.owner.businessName}</p>
                </div>
              )}
            </div>

            {/* Review Action Footer */}
            <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-text-secondary">
                Current Approval State:{" "}
                <strong className="uppercase text-text-primary">
                  {selectedWorkspace.approvalStatus}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                {selectedWorkspace.approvalStatus !== "rejected" && (
                  <button
                    onClick={() => {
                      setRejectModalWs(selectedWorkspace);
                      setRejectionReason("");
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 transition"
                  >
                    Reject Listing
                  </button>
                )}

                {selectedWorkspace.approvalStatus !== "approved" && (
                  <button
                    onClick={() => handleApprovalAction(selectedWorkspace._id, "approved")}
                    disabled={actionLoading}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-2"
                  >
                    {actionLoading && <FiRefreshCw className="size-3.5 animate-spin" />}
                    <span>Approve & Publish</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL WITH REASON PROMPT */}
      {rejectModalWs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <FiXCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Reject Workspace Listing</h3>
                <p className="text-xs text-text-secondary">Provide feedback for {rejectModalWs.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label htmlFor="reason" className="font-semibold text-text-primary block">
                Reason for Rejection (Visible to Host):
              </label>
              <textarea
                id="reason"
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete pricing details, low quality photos, or address landmark needed..."
                className="w-full p-3 text-xs rounded-xl border border-border bg-background text-text-primary outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalWs(null)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApprovalAction(
                    rejectModalWs._id,
                    "rejected",
                    rejectionReason.trim() || "Does not meet listing criteria."
                  )
                }
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs flex items-center gap-2"
              >
                {actionLoading && <FiRefreshCw className="size-3.5 animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
