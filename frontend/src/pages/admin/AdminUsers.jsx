import { useState, useEffect, useCallback } from "react";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiSlash,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiBriefcase,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

import API_URL from "../../utils/apiConfig";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Detail Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Toggle Modal State
  const [targetUser, setTargetUser] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch users list
  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        if (search.trim()) queryParams.set("search", search.trim());
        if (roleFilter) queryParams.set("role", roleFilter);
        if (statusFilter) queryParams.set("status", statusFilter);

        const response = await fetch(`${API_URL}/api/admin/users?${queryParams.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch users.");
        }

        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Fetch users error:", err);
        setError(err.message || "Could not load users.");
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, statusFilter]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Fetch single user details modal
  const openUserDetail = async (userId) => {
    setSelectedUserId(userId);
    setUserDetail(null);
    setLoadingDetail(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load user details.");
      }

      setUserDetail(data);
    } catch (err) {
      console.error("Fetch user detail error:", err);
      alert(err.message || "Could not load user profile.");
      setSelectedUserId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async () => {
    if (!targetUser) return;

    try {
      setStatusLoading(true);

      const response = await fetch(`${API_URL}/api/admin/users/${targetUser._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !targetUser.isActive }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update account status.");
      }

      // Update in local state
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isActive: !u.isActive } : u))
      );

      // If open in modal, update that too
      if (userDetail && userDetail.user._id === targetUser._id) {
        setUserDetail((prev) => ({
          ...prev,
          user: { ...prev.user, isActive: !prev.user.isActive },
        }));
      }

      setTargetUser(null);
    } catch (err) {
      console.error("Toggle status error:", err);
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
            Customer & Host Management
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Search, inspect activity, view profiles, and suspend or activate user accounts across Nestora.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-text-primary hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto disabled:opacity-60"
        >
          <FiRefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
        {[
          { label: "All Users", value: "" },
          { label: "Customers", value: "customer" },
          { label: "Workspace Hosts", value: "owner" },
          { label: "Administrators", value: "admin" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRoleFilter(tab.value)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              roleFilter === tab.value
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            placeholder="Search by name, email, phone, business..."
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition appearance-none cursor-pointer"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended Only</option>
            </select>
            <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-text-secondary pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchUsers(1)} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Users Data Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Business / Location</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-text-secondary">
                    <div className="inline-flex items-center gap-2">
                      <FiRefreshCw className="size-4 animate-spin text-primary" />
                      <span>Loading accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-text-secondary">
                    <p className="font-medium">No users found matching your criteria.</p>
                    <p className="text-[11px] text-text-secondary/80 mt-1">
                      Try clearing filters or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-slate-100 border border-border flex items-center justify-center font-bold text-text-primary text-xs uppercase shrink-0">
                            {u.fullName?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text-primary truncate">{u.fullName}</p>
                            <p className="text-[11px] text-text-secondary truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : u.role === "owner"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {u.role === "owner" ? "Host" : u.role}
                        </span>
                      </td>

                      {/* Phone Contact */}
                      <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                        {u.phone || <span className="text-text-secondary/50">—</span>}
                      </td>

                      {/* Business info (if host) */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                        {u.businessName ? (
                          <div className="truncate max-w-[160px]">
                            <span className="font-semibold text-text-primary">{u.businessName}</span>
                            {u.businessCity && <span className="text-[11px]"> • {u.businessCity}</span>}
                          </div>
                        ) : (
                          <span className="text-text-secondary/50">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {u.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openUserDetail(u._id)}
                            title="View Profile & Activity"
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
                          >
                            <FiEye className="size-3.5" />
                          </button>

                          {u.role !== "admin" && (
                            <button
                              onClick={() => setTargetUser(u)}
                              title={u.isActive ? "Suspend Account" : "Activate Account"}
                              className={`p-1.5 rounded-lg border transition ${
                                u.isActive
                                  ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              <FiSlash className="size-3.5" />
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
              users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <FiChevronLeft className="size-4" />
              </button>
              <span className="font-semibold text-text-primary px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <FiChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  <FiUsers className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">User Account Dossier</h2>
                  <p className="text-xs text-text-secondary">Detailed account profile & platform activity</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
              >
                <FiX className="size-5" />
              </button>
            </div>

            {loadingDetail || !userDetail ? (
              <div className="py-12 text-center text-text-secondary">
                <FiRefreshCw className="size-5 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs">Fetching profile & records...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-border text-xs">
                  <div>
                    <span className="text-text-secondary block">Full Name:</span>
                    <span className="font-bold text-text-primary text-sm">
                      {userDetail.user.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Account Role:</span>
                    <span className="font-bold uppercase tracking-wider text-primary">
                      {userDetail.user.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <FiMail className="size-3.5" /> Email Address:
                    </span>
                    <span className="font-semibold text-text-primary">{userDetail.user.email}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <FiPhone className="size-3.5" /> Phone Number:
                    </span>
                    <span className="font-semibold text-text-primary">
                      {userDetail.user.phone || "Not provided"}
                    </span>
                  </div>
                  {userDetail.user.businessName && (
                    <>
                      <div>
                        <span className="text-text-secondary flex items-center gap-1.5">
                          <FiBriefcase className="size-3.5" /> Business Name:
                        </span>
                        <span className="font-semibold text-text-primary">
                          {userDetail.user.businessName}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary flex items-center gap-1.5">
                          <FiMapPin className="size-3.5" /> Operating City:
                        </span>
                        <span className="font-semibold text-text-primary">
                          {userDetail.user.businessCity || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-text-secondary block">Registration Date:</span>
                    <span className="font-semibold text-text-primary">
                      {new Date(userDetail.user.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Account Status:</span>
                    <span
                      className={`font-bold uppercase tracking-wider ${
                        userDetail.user.isActive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {userDetail.user.isActive ? "Active Account" : "Suspended"}
                    </span>
                  </div>
                </div>

                {/* Activity List: Workspaces if Owner */}
                {userDetail.user.role === "owner" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Workspaces Listed ({userDetail.relatedData?.workspaceCount || 0})
                      </h3>
                    </div>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden text-xs">
                      {userDetail.relatedData?.workspaces?.length > 0 ? (
                        userDetail.relatedData.workspaces.map((ws) => (
                          <div key={ws._id} className="p-3 flex items-center justify-between gap-3 bg-surface">
                            <div className="min-w-0">
                              <p className="font-bold text-text-primary truncate">{ws.name}</p>
                              <p className="text-[11px] text-text-secondary truncate">
                                {ws.address?.city || "City"} • {ws.type}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ws.approvalStatus === "approved"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : ws.approvalStatus === "rejected"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {ws.approvalStatus}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-text-secondary">No workspaces created yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Activity List: Bookings if Customer */}
                {userDetail.user.role === "customer" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Recent Reservations ({userDetail.relatedData?.bookingCount || 0})
                      </h3>
                    </div>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden text-xs">
                      {userDetail.relatedData?.bookings?.length > 0 ? (
                        userDetail.relatedData.bookings.map((bk) => (
                          <div key={bk._id} className="p-3 flex items-center justify-between gap-3 bg-surface">
                            <div className="min-w-0">
                              <p className="font-bold text-text-primary truncate">
                                {bk.bookingReference} • {bk.workspace?.name || "Workspace"}
                              </p>
                              <p className="text-[11px] text-text-secondary truncate">
                                {new Date(bk.bookingDate).toLocaleDateString()} • ₹{bk.pricing?.totalAmount || 0}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                bk.status === "confirmed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : bk.status === "completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : bk.status === "cancelled"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {bk.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-text-secondary">No bookings made yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  targetUser.isActive
                    ? "bg-rose-100 text-rose-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <FiSlash className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {targetUser.isActive ? "Suspend Account" : "Reactivate Account"}
                </h3>
                <p className="text-xs text-text-secondary">Confirm change for this user</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to{" "}
              <strong className="text-text-primary">
                {targetUser.isActive ? "suspend" : "reactivate"}
              </strong>{" "}
              the account for <strong>{targetUser.fullName}</strong> ({targetUser.email})?
              {targetUser.isActive &&
                " The user will immediately be blocked from logging in or booking spaces."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTargetUser(null)}
                disabled={statusLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusLoading}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition shadow-xs flex items-center gap-2 ${
                  targetUser.isActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {statusLoading && <FiRefreshCw className="size-3.5 animate-spin" />}
                <span>{targetUser.isActive ? "Confirm Suspension" : "Confirm Reactivation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
