import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FiUsers,
  FiLayers,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertTriangle,
  FiArrowUpRight,
  FiRefreshCw,
} from "react-icons/fi";

import API_URL from "../../utils/apiConfig";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load dashboard statistics.");
      }

      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      console.error("Fetch admin stats error:", err);
      setError(err.message || "Could not retrieve statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live operations, workspace moderation, platform traffic & performance metrics.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-text-primary hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto disabled:opacity-60"
        >
          <FiRefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchStats}
            className="underline font-semibold text-rose-800 ml-4 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Pending Workspace Approvals Alert Banner */}
      {!loading && stats?.workspaces?.pending > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <FiAlertTriangle className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {stats.workspaces.pending} Workspace Listing{stats.workspaces.pending > 1 ? "s" : ""} Awaiting Review
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                New spaces submitted by hosts are queued and not visible to public visitors until approved.
              </p>
            </div>
          </div>
          <Link
            to="/admin/approvals"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow-xs shrink-0 self-start sm:self-auto"
          >
            <span>Review Queue</span>
            <FiArrowUpRight className="size-4" />
          </Link>
        </div>
      )}

      {/* Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Platform Revenue
            </span>
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiTrendingUp className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {loading ? "..." : `₹${(stats?.bookings?.totalRevenue || 0).toLocaleString("en-IN")}`}
          </p>
          <div className="mt-2 text-[11px] text-text-secondary flex items-center gap-1.5">
            <span className="font-semibold text-emerald-600">From confirmed</span>
            <span>& completed bookings</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Total Reservations
            </span>
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiCalendar className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {loading ? "..." : stats?.bookings?.total ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-text-secondary flex items-center gap-2">
            <span className="text-emerald-600 font-semibold">{stats?.bookings?.confirmed || 0} Confirmed</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{stats?.bookings?.pending || 0} Pending</span>
          </div>
        </div>

        {/* Workspaces Inventory */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Total Workspaces
            </span>
            <div className="size-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <FiLayers className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {loading ? "..." : stats?.workspaces?.total ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-text-secondary flex items-center gap-2">
            <span className="text-emerald-600 font-semibold">{stats?.workspaces?.approved || 0} Approved</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{stats?.workspaces?.pending || 0} In Review</span>
          </div>
        </div>

        {/* User Base */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Registered Users
            </span>
            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiUsers className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {loading ? "..." : stats?.users?.total ?? 0}
          </p>
          <div className="mt-2 text-[11px] text-text-secondary flex items-center gap-2">
            <span>{stats?.users?.customers || 0} Customers</span>
            <span>•</span>
            <span>{stats?.users?.owners || 0} Hosts</span>
          </div>
        </div>
      </div>

      {/* Secondary Status Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workspace Health Card */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">Workspace Moderation</h3>
            <Link
              to="/admin/workspaces"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <FiArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-text-secondary">
                <FiCheckCircle className="size-4 text-emerald-500" /> Approved & Public
              </span>
              <span className="font-bold text-text-primary">{stats?.workspaces?.approved || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-text-secondary">
                <FiClock className="size-4 text-amber-500" /> Pending Review
              </span>
              <span className="font-bold text-text-primary">{stats?.workspaces?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-text-secondary">
                <FiXCircle className="size-4 text-rose-500" /> Rejected Submissions
              </span>
              <span className="font-bold text-text-primary">{stats?.workspaces?.rejected || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-text-secondary">
                <FiAlertTriangle className="size-4 text-slate-400" /> Deactivated / Inactive
              </span>
              <span className="font-bold text-text-primary">{stats?.workspaces?.inactive || 0}</span>
            </div>
          </div>
        </div>

        {/* Bookings Status Breakdown Card */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">Booking Distribution</h3>
            <Link
              to="/admin/reservations"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <FiArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Confirmed Bookings</span>
              <span className="font-bold text-emerald-600">{stats?.bookings?.confirmed || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Completed Visits</span>
              <span className="font-bold text-blue-600">{stats?.bookings?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Pending Confirmation</span>
              <span className="font-bold text-amber-600">{stats?.bookings?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Cancelled / Rejected</span>
              <span className="font-bold text-rose-600">{stats?.bookings?.cancelled || 0}</span>
            </div>
          </div>
        </div>

        {/* Users & Accounts Overview */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">Accounts Summary</h3>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Users</span>
              <FiArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Workspace Customers</span>
              <span className="font-bold text-text-primary">{stats?.users?.customers || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Space Hosts & Owners</span>
              <span className="font-bold text-text-primary">{stats?.users?.owners || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">New Signups (Last 30 Days)</span>
              <span className="font-bold text-emerald-600">{stats?.users?.newLast30Days || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Suspended Accounts</span>
              <span className="font-bold text-rose-600">{stats?.users?.inactive || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Platform Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Workspace Submissions */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">Recent Workspace Listings</h3>
            <Link to="/admin/approvals" className="text-xs font-semibold text-primary hover:underline">
              Approvals Queue
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {recentActivity?.workspaces?.length > 0 ? (
              recentActivity.workspaces.map((ws) => (
                <div key={ws._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-primary truncate">{ws.name}</p>
                    <p className="text-[11px] text-text-secondary truncate">
                      {ws.address?.city || "Unknown City"} • Host: {ws.owner?.fullName || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 ${
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
              <p className="py-4 text-center text-xs text-text-secondary">No workspaces found.</p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text-primary">Recent Reservations</h3>
            <Link to="/admin/reservations" className="text-xs font-semibold text-primary hover:underline">
              All Bookings
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {recentActivity?.bookings?.length > 0 ? (
              recentActivity.bookings.map((bk) => (
                <div key={bk._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {bk.bookingReference} • {bk.workspace?.name || "Workspace"}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate">
                      Customer: {bk.customer?.fullName || "Guest"} • ₹{bk.pricing?.totalAmount || 0}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 ${
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
              <p className="py-4 text-center text-xs text-text-secondary">No recent reservations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

