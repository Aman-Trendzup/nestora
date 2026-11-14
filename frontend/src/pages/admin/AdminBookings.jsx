import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  FiCalendar,
  FiSearch,
  FiFilter,
  FiEye,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiClock,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiCreditCard,
  FiTag,
  FiEdit3,
} from "react-icons/fi";

import API_URL from "../../utils/apiConfig";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Dossier Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Override Modal State
  const [overrideModalBooking, setOverrideModalBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Fetch bookings list
  const fetchBookings = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        if (search.trim()) queryParams.set("search", search.trim());
        if (statusFilter) queryParams.set("status", statusFilter);
        if (typeFilter) queryParams.set("bookingType", typeFilter);
        if (startDate) queryParams.set("startDate", startDate);
        if (endDate) queryParams.set("endDate", endDate);

        const response = await fetch(`${API_URL}/api/admin/bookings?${queryParams.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load reservations.");
        }

        setBookings(data.bookings);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Fetch admin bookings error:", err);
        setError(err.message || "Could not retrieve reservations.");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, typeFilter, startDate, endDate]
  );

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  // Open full booking detail modal
  const openBookingDetail = async (bookingId) => {
    setLoadingDetail(true);
    setSelectedBooking(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/bookings/${bookingId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load booking dossier.");
      }

      setSelectedBooking(data.booking);
    } catch (err) {
      console.error("Fetch booking detail error:", err);
      alert(err.message || "Could not load booking.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Status Override
  const handleStatusOverride = async () => {
    if (!overrideModalBooking) return;

    try {
      setOverrideLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/bookings/${overrideModalBooking._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: newStatus,
            paymentStatus: newPaymentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update booking status.");
      }

      // Update in local state
      setBookings((prev) =>
        prev.map((b) =>
          b._id === overrideModalBooking._id
            ? { ...b, status: newStatus, paymentStatus: newPaymentStatus }
            : b
        )
      );

      // If open in detail modal, update it too
      if (selectedBooking && selectedBooking._id === overrideModalBooking._id) {
        setSelectedBooking((prev) => ({
          ...prev,
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }));
      }

      setOverrideModalBooking(null);
    } catch (err) {
      console.error("Status override error:", err);
      alert(err.message || "Action failed.");
    } finally {
      setOverrideLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Platform Reservation Management
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Master booking ledger: search, inspect financial breakdowns, review schedule logs, and manage reservation statuses.
          </p>
        </div>

        <button
          onClick={() => fetchBookings(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-text-primary hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto disabled:opacity-60"
        >
          <FiRefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking ref, customer, space..."
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-text-secondary pointer-events-none" />
        </div>

        {/* Booking Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-10 pl-3.5 pr-8 text-xs font-medium rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition appearance-none cursor-pointer"
          >
            <option value="">All Durations</option>
            <option value="hourly">Hourly Booking</option>
            <option value="full-day">Full Day</option>
          </select>
          <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-text-secondary pointer-events-none" />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Start Date"
            className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-surface text-text-primary outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchBookings(1)} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Bookings Ledger Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-border text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-5 py-3.5">Reference</th>
                <th className="px-4 py-3.5">Workspace</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Date & Schedule</th>
                <th className="px-4 py-3.5">Guests</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-text-secondary">
                    <div className="inline-flex items-center gap-2">
                      <FiRefreshCw className="size-4 animate-spin text-primary" />
                      <span>Loading platform reservations...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-text-secondary">
                    <p className="font-medium">No reservations match your search or filter parameters.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((bk) => {
                  return (
                    <tr key={bk._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Reference */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-text-primary text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {bk.bookingReference}
                        </span>
                        <span className="text-[10px] text-text-secondary block mt-0.5">
                          {new Date(bk.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </td>

                      {/* Workspace */}
                      <td className="px-4 py-3.5 text-text-secondary">
                        <span className="font-bold text-text-primary block truncate max-w-[160px]">
                          {bk.workspace?.name || "Workspace"}
                        </span>
                        <span className="text-[11px] truncate max-w-[160px] block">
                          {bk.workspace?.address?.city || "City"} • {bk.workspace?.type}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap">
                        <span className="font-semibold text-text-primary block truncate max-w-[140px]">
                          {bk.customer?.fullName || "Guest"}
                        </span>
                        <span className="text-[11px] truncate max-w-[140px] block">
                          {bk.customer?.email}
                        </span>
                      </td>

                      {/* Date & Schedule */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                        <span className="font-semibold text-text-primary block">
                          {new Date(bk.bookingDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[11px] block">
                          {bk.bookingType === "hourly"
                            ? `${bk.startTime} - ${bk.endTime} (${bk.duration} hrs)`
                            : "Full Day Access"}
                        </span>
                      </td>

                      {/* Guests */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                        <span className="font-semibold text-text-primary">{bk.guests}</span> guest(s)
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-text-primary">
                          ₹{(bk.pricing?.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                        {bk.pricing?.discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-600 block">
                            -₹{bk.pricing.discountAmount} coupon
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            bk.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : bk.status === "completed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : bk.status === "cancelled" || bk.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {bk.status}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            bk.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {bk.paymentStatus || "unpaid"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Dossier button */}
                          <button
                            onClick={() => openBookingDetail(bk._id)}
                            title="View Booking Itinerary & Details"
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
                          >
                            <FiEye className="size-3.5" />
                          </button>

                          {/* Override Status button */}
                          <button
                            onClick={() => {
                              setOverrideModalBooking(bk);
                              setNewStatus(bk.status);
                              setNewPaymentStatus(bk.paymentStatus || "unpaid");
                            }}
                            title="Admin Status Override"
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-primary hover:bg-slate-100 transition"
                          >
                            <FiEdit3 className="size-3.5" />
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
              reservations
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchBookings(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <FiChevronLeft className="size-4" />
              </button>
              <span className="font-semibold text-text-primary px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchBookings(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <FiChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL BOOKING DOSSIER MODAL */}
      {(selectedBooking || loadingDetail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Reservation Record
                </span>
                <h2 className="text-lg font-bold text-text-primary">
                  {selectedBooking ? selectedBooking.bookingReference : "Loading Details..."}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
              >
                <FiX className="size-5" />
              </button>
            </div>

            {loadingDetail || !selectedBooking ? (
              <div className="py-12 text-center text-text-secondary">
                <FiRefreshCw className="size-5 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs">Fetching complete booking itinerary...</p>
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-border">
                  <div>
                    <span className="text-text-secondary block text-[11px]">Reservation Status</span>
                    <span className="font-bold text-text-primary text-sm uppercase tracking-wider">
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-text-secondary block text-[11px]">Payment</span>
                    <span
                      className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${
                        selectedBooking.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {selectedBooking.paymentStatus || "unpaid"}
                    </span>
                  </div>
                </div>

                {/* Itinerary Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
                    <span className="font-bold uppercase tracking-wider text-text-secondary text-[10px] block">
                      Customer Details
                    </span>
                    <p className="font-bold text-text-primary text-sm">
                      {selectedBooking.customer?.fullName}
                    </p>
                    <p className="text-text-secondary">{selectedBooking.customer?.email}</p>
                    <p className="text-text-secondary">
                      {selectedBooking.customer?.phone || "No phone provided"}
                    </p>
                  </div>

                  {/* Workspace Card */}
                  <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
                    <span className="font-bold uppercase tracking-wider text-text-secondary text-[10px] block">
                      Workspace Details
                    </span>
                    <p className="font-bold text-text-primary text-sm">
                      {selectedBooking.workspace?.name}
                    </p>
                    <p className="text-text-secondary">
                      {selectedBooking.workspace?.address?.fullAddress || "Address"}
                    </p>
                    <p className="text-[11px] text-text-secondary">
                      Host: {selectedBooking.workspace?.owner?.fullName} (
                      {selectedBooking.workspace?.owner?.email})
                    </p>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-2">
                  <span className="font-bold uppercase tracking-wider text-text-secondary text-[10px] block">
                    Reserved Slot
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-text-secondary block">Booking Date:</span>
                      <span className="font-bold text-text-primary">
                        {new Date(selectedBooking.bookingDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary block">Booking Type:</span>
                      <span className="font-bold text-text-primary capitalize">
                        {selectedBooking.bookingType}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary block">Time Slot:</span>
                      <span className="font-bold text-text-primary">
                        {selectedBooking.bookingType === "hourly"
                          ? `${selectedBooking.startTime} - ${selectedBooking.endTime} (${selectedBooking.duration} hrs)`
                          : "Full Day Access"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Ledger Breakdown */}
                <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-2">
                  <span className="font-bold uppercase tracking-wider text-text-secondary text-[10px] block">
                    Financial Summary
                  </span>
                  <div className="space-y-1.5 divide-y divide-border/60">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-text-secondary">Rate Breakdown:</span>
                      <span className="font-semibold text-text-primary">
                        ₹{selectedBooking.pricing?.unitPrice} × {selectedBooking.pricing?.quantity}{" "}
                        {selectedBooking.pricing?.unitLabel || "unit(s)"}
                      </span>
                    </div>

                    {selectedBooking.pricing?.discountAmount > 0 && (
                      <div className="flex items-center justify-between pt-1 text-emerald-600">
                        <span>Coupon Discount ({selectedBooking.coupon?.code || "PROMO"}):</span>
                        <span className="font-semibold">-₹{selectedBooking.pricing.discountAmount}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-sm font-bold text-text-primary">
                      <span>Total Charged:</span>
                      <span className="text-emerald-700">
                        ₹{(selectedBooking.pricing?.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
                    <span className="font-bold uppercase tracking-wider text-text-secondary text-[10px] block mb-1">
                      Customer Special Requests
                    </span>
                    <p className="text-text-primary italic">"{selectedBooking.specialRequests}"</p>
                  </div>
                )}

                {/* Reschedule Logs */}
                {selectedBooking.rescheduleHistory?.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-text-secondary text-[10px] block">
                      Reschedule History ({selectedBooking.rescheduleHistory.length})
                    </span>
                    <div className="divide-y divide-border border border-border rounded-xl p-3 bg-surface text-[11px] space-y-1">
                      {selectedBooking.rescheduleHistory.map((hist, i) => (
                        <div key={i} className="pt-1">
                          <p className="text-text-primary font-semibold">
                            Moved from: {new Date(hist.previousBookingDate).toLocaleDateString()} (
                            {hist.previousStartTime || "N/A"})
                          </p>
                          <p className="text-text-secondary">
                            Rescheduled on {new Date(hist.rescheduledAt).toLocaleString()}{" "}
                            {hist.reason ? `• Reason: ${hist.reason}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancellation notice */}
                {selectedBooking.cancelledAt && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <p className="font-bold">Cancelled Reservation</p>
                    <p className="text-[11px]">
                      Cancelled at: {new Date(selectedBooking.cancelledAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATUS OVERRIDE MODAL */}
      {overrideModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FiEdit3 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Admin Status Override</h3>
                <p className="text-xs text-text-secondary">{overrideModalBooking.bookingReference}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-text-primary block mb-1">Reservation Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-text-primary outline-none focus:border-primary transition"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text-primary block mb-1">Payment Status:</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-text-primary outline-none focus:border-primary transition"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOverrideModalBooking(null)}
                disabled={overrideLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusOverride}
                disabled={overrideLoading}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white transition shadow-xs flex items-center gap-2"
              >
                {overrideLoading && <FiRefreshCw className="size-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
