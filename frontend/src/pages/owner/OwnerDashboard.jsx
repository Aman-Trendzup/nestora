import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  FiLayers,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiPlus,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";

import API_BASE_URL from "../../utils/apiConfig";

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [wsRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/workspaces/owner/my-workspaces`, {
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/api/bookings/owner/my-reservations?limit=20`, {
          credentials: "include",
        }),
      ]);

      const wsData = await wsRes.json();
      const resData = await resRes.json();

      if (wsData.success) {
        setWorkspaces(wsData.workspaces || []);
      }
      if (resData.success) {
        setReservations(resData.bookings || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Unable to load dashboard information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActionSuccess("");
      const response = await fetch(
        `${API_BASE_URL}/api/bookings/owner/my-reservations/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update reservation status.");
      }

      setActionSuccess(`Reservation marked as ${newStatus}.`);
      setReservations((prev) =>
        prev.map((r) => (r._id === bookingId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err.message || "Error updating status.");
    }
  };

  // KPIs
  const totalWorkspaces = workspaces.length;
  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter(
    (r) => r.status === "pending"
  ).length;

  const totalEarnings = reservations
    .filter((r) => ["confirmed", "completed"].includes(r.status))
    .reduce((sum, r) => sum + (r.pricing?.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-text-primary">
              Owner Dashboard
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Welcome back, {user?.fullName}! Here is an overview of your
            workspaces and customer bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/owner/workspaces/new"
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover shadow-xs transition"
          >
            <FiPlus className="size-4" />
            <span>Add Workspace</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button
            onClick={() => setActionSuccess("")}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Listings */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Total Workspaces
            </span>
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiLayers className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-text-primary">
            {loading ? "..." : totalWorkspaces}
          </p>
          <div className="mt-2 flex items-center text-xs text-text-secondary">
            <Link
              to="/owner/workspaces"
              className="font-medium text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage listings</span>
              <FiArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Total Bookings
            </span>
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiCalendar className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-text-primary">
            {loading ? "..." : totalReservations}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            Across all your spaces
          </p>
        </div>

        {/* Pending Actions */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Pending Actions
            </span>
            <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiClock className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-text-primary">
            {loading ? "..." : pendingReservations}
          </p>
          <p className="mt-2 text-xs text-amber-700 font-medium">
            {pendingReservations > 0 ? "Awaiting your confirmation" : "All caught up"}
          </p>
        </div>

        {/* Revenue */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Gross Value
            </span>
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiTrendingUp className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-text-primary">
            {loading ? "..." : formatPrice(totalEarnings)}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            Confirmed & completed bookings
          </p>
        </div>
      </div>

      {/* Recent Reservations Section */}
      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              Recent Customer Reservations
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Review and confirm inbound booking requests from customers.
            </p>
          </div>
          <Link
            to="/owner/reservations"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View all reservations</span>
            <FiArrowRight className="size-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-secondary text-sm">
            Loading reservations...
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-text-primary">
              No reservations yet
            </p>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Once customers book your workspaces, reservations will appear here
              for you to confirm or manage.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Workspace</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reservations.slice(0, 6).map((reservation) => {
                  const customer = reservation.customer || {};
                  const workspace = reservation.workspace || {};

                  return (
                    <tr
                      key={reservation._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text-primary">
                          {customer.fullName || "Guest Customer"}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {customer.email} {customer.phone ? `• ${customer.phone}` : ""}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-medium text-text-primary">
                        {workspace.name || "Workspace"}
                      </td>

                      <td className="px-6 py-4 text-xs text-text-secondary">
                        <p className="font-medium text-text-primary">
                          {new Date(reservation.bookingDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </p>
                        <p>
                          {reservation.bookingType === "hourly"
                            ? `${reservation.startTime} - ${reservation.endTime}`
                            : "Full Day"}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-bold text-text-primary">
                        {formatPrice(reservation.pricing?.totalAmount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${reservation.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : reservation.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : reservation.status === "cancelled"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {reservation.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {reservation.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(reservation._id, "confirmed")
                              }
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(reservation._id, "rejected")
                              }
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-md hover:bg-rose-100 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary">
                            {reservation.status === "confirmed" ? "Active" : "Closed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

