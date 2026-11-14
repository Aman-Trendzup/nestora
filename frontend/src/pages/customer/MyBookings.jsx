import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
} from "react-icons/fi";
import {
  calculateFrontendBookingPrice,
  normalizeWorkspacePricing,
} from "../../utils/pricingCalculator";
import { getImageUrl } from "../../utils/imageHelper";
import API_BASE_URL from "../../utils/apiConfig";

const formatBookingDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FiCheckCircle className="size-3.5" /> Confirmed
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <FiAlertCircle className="size-3.5" /> Pending Confirmation
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <FiXCircle className="size-3.5" /> Cancelled
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <FiCheckCircle className="size-3.5" /> Completed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Cancellation state
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellingInProgress, setCancellingInProgress] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  // Reschedule state
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newBookingDate: "",
    newBookingType: "hourly",
    newStartTime: "09:00",
    newDuration: 2,
    reason: "",
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  const handleOpenReschedule = (booking) => {
    const formattedDate = booking.bookingDate
      ? new Date(booking.bookingDate).toISOString().slice(0, 10)
      : "";

    // Build fallback pricing on wsToUse if not populated or missing
    let wsToUse = booking.workspace ? { ...booking.workspace } : {};
    if (
      !wsToUse.pricing ||
      (!wsToUse.pricing.hourly?.price && !wsToUse.pricing.daily?.price)
    ) {
      if (booking.pricing?.unitPrice) {
        wsToUse.pricing = {
          pricingType: booking.pricing.pricingType || "per_space",
          hourly: {
            enabled: true,
            price:
              booking.bookingType === "hourly"
                ? booking.pricing.unitPrice
                : Math.max(1, Math.round(booking.pricing.unitPrice / 5)),
          },
          daily: {
            enabled: true,
            price:
              booking.bookingType === "full-day"
                ? booking.pricing.unitPrice
                : Math.max(1, Math.round(booking.pricing.unitPrice * 5)),
          },
        };
      }
    }

    const norm = normalizeWorkspacePricing(wsToUse);
    let hourlyEnabled = norm?.hourly?.enabled ?? true;
    let dailyEnabled = norm?.daily?.enabled ?? true;
    if (!hourlyEnabled && !dailyEnabled) {
      hourlyEnabled = true;
      dailyEnabled = true;
    }

    let initialBookingType = booking.bookingType || "hourly";
    if (!hourlyEnabled && dailyEnabled) initialBookingType = "full-day";
    if (!dailyEnabled && hourlyEnabled) initialBookingType = "hourly";

    setReschedulingBooking({ ...booking, workspace: wsToUse });
    setRescheduleForm({
      newBookingDate: formattedDate,
      newBookingType: initialBookingType,
      newStartTime: booking.startTime || "09:00",
      newDuration: booking.duration || 2,
      reason: "",
    });
    setRescheduleError("");
  };

  const recalculatedPrice = useMemo(() => {
    if (!reschedulingBooking?.workspace) return null;
    try {
      const calc = calculateFrontendBookingPrice(
        reschedulingBooking.workspace,
        rescheduleForm.newBookingType,
        rescheduleForm.newBookingType === "hourly"
          ? rescheduleForm.newDuration
          : 1,
        reschedulingBooking.guests || 1
      );
      if (!calc) return null;
      let discount = 0;
      if (reschedulingBooking.coupon?.discountAmount) {
        discount = Math.min(
          reschedulingBooking.coupon.discountAmount,
          calc.subtotal
        );
      }
      return {
        subtotal: calc.subtotal,
        discount,
        total: Math.max(0, calc.subtotal - discount),
        breakdownText: calc.breakdownText,
      };
    } catch {
      const baseUnit = reschedulingBooking.pricing?.unitPrice || 100;
      const hours =
        rescheduleForm.newBookingType === "hourly"
          ? Number(rescheduleForm.newDuration) || 1
          : 5;
      const isPerPerson =
        reschedulingBooking.pricing?.pricingType === "per_person";
      const guestMultiplier = isPerPerson
        ? reschedulingBooking.guests || 1
        : 1;
      const subtotal = baseUnit * hours * guestMultiplier;
      return {
        subtotal,
        discount: 0,
        total: subtotal,
      };
    }
  }, [
    reschedulingBooking,
    rescheduleForm.newBookingType,
    rescheduleForm.newDuration,
  ]);

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!reschedulingBooking) return;
    try {
      setRescheduleLoading(true);
      setRescheduleError("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/${reschedulingBooking._id}/reschedule`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(rescheduleForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reschedule booking.");
      }

      setBookings((prev) =>
        prev.map((b) => (b._id === reschedulingBooking._id ? data.booking : b))
      );
      setActionMessage({
        text: "Booking has been successfully rescheduled!",
        type: "success",
      });
      setReschedulingBooking(null);
    } catch (err) {
      setRescheduleError(err.message || "Unable to reschedule reservation.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError(err.message || "Something went wrong while loading bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    try {
      setCancellingInProgress(true);
      setActionMessage({ text: "", type: "" });

      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel reservation.");
      }

      setActionMessage({
        text: "Booking has been successfully cancelled.",
        type: "success",
      });

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
      );
      setCancellingId(null);
    } catch (err) {
      setActionMessage({
        text: err.message || "Failed to cancel booking.",
        type: "error",
      });
    } finally {
      setCancellingInProgress(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming")
      return b.status === "confirmed" || b.status === "pending";
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Stats Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your workspace reservations, view booking details and
            schedules.
          </p>
        </div>

        <Link
          to="/workspaces"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover shadow-xs w-fit"
        >
          <span>Find Workspaces</span>
          <FiArrowRight className="size-4" />
        </Link>
      </div>

      {/* Action Notification */}
      {actionMessage.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between border ${actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage({ text: "", type: "" })}
            className="text-xs font-semibold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-6 overflow-x-auto no-scrollbar">
        {[
          { key: "all", label: "All Bookings", count: bookings.length },
          {
            key: "upcoming",
            label: "Upcoming",
            count: bookings.filter((b) =>
              ["confirmed", "pending"].includes(b.status)
            ).length,
          },
          {
            key: "completed",
            label: "Completed",
            count: bookings.filter((b) => b.status === "completed").length,
          },
          {
            key: "cancelled",
            label: "Cancelled",
            count: bookings.filter((b) => b.status === "cancelled").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-text-secondary"
                }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-3" />
          <p className="text-sm text-text-secondary">Loading your reservations...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-text-secondary mb-4">
            <FiCalendar className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            No reservations found
          </h2>
          <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
            {activeTab === "all"
              ? "You haven't booked any workspaces yet. Discover modern, flexible workspaces designed for focus and productivity."
              : `You have no ${activeTab} reservations.`}
          </p>
          <Link
            to="/workspaces"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition"
          >
            Browse Workspaces
          </Link>
        </div>
      )}

      {/* Bookings Grid */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => {
            const workspace = booking.workspace || {};
            const firstImage = getImageUrl(workspace.images?.[0]);

            const canCancel =
              booking.status === "pending" || booking.status === "confirmed";

            return (
              <div
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Workspace Image & Badges */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={firstImage}
                      alt={workspace.name || "Workspace"}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(booking.status)}
                    </div>
                    {booking.bookingCode && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                        #{booking.bookingCode}
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="font-semibold text-base text-text-primary line-clamp-1 hover:text-primary">
                        <Link to={`/workspaces/${workspace.slug}`}>
                          {workspace.name || "Workspace"}
                        </Link>
                      </h2>
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-text-secondary mb-4">
                      <FiMapPin className="size-3.5 shrink-0 text-text-secondary" />
                      <span className="truncate">
                        {workspace.address?.area
                          ? `${workspace.address.area}, ${workspace.address.city}`
                          : workspace.address?.city || "Location available on venue"}
                      </span>
                    </p>

                    <div className="space-y-2 border-t border-border pt-4 text-xs text-text-secondary">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FiCalendar className="size-3.5 text-primary" />
                          <span>Date</span>
                        </span>
                        <span className="font-medium text-text-primary">
                          {formatBookingDate(booking.bookingDate)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FiClock className="size-3.5 text-primary" />
                          <span>Timing</span>
                        </span>
                        <span className="font-medium text-text-primary">
                          {booking.bookingType === "hourly"
                            ? `${booking.startTime} - ${booking.endTime} (${booking.duration} hr)`
                            : "Full Day Access"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FiUsers className="size-3.5 text-primary" />
                          <span>Guests</span>
                        </span>
                        <span className="font-medium text-text-primary">
                          {booking.guests} {booking.guests === 1 ? "Person" : "People"}
                        </span>
                      </div>

                      {booking.pricing?.breakdownText && (
                        <div className="flex items-center justify-between pt-1 border-t border-dashed border-border/50 text-[11px]">
                          <span className="text-text-secondary">Calculation</span>
                          <span className="font-medium text-text-primary text-right truncate max-w-[200px]" title={booking.pricing.breakdownText}>
                            {booking.pricing.breakdownText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Actions */}
                <div className="border-t border-border bg-slate-50/50 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
                      Total Due at Venue
                    </p>
                    <p className="text-base font-bold text-text-primary">
                      {formatPrice(
                        booking.pricing?.totalAmount,
                        booking.pricing?.currency
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReschedule(booking)}
                          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancellingId(booking._id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    <Link
                      to={`/workspaces/${workspace.slug}`}
                      className="rounded-lg bg-surface border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-slate-100 transition"
                    >
                      View Space
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <FiAlertCircle className="size-6" />
            </div>

            <h3 className="text-lg font-bold text-text-primary">
              Cancel Workspace Reservation?
            </h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Are you sure you want to cancel this booking? This slot will be
              released for other users. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancellingId(null)}
                disabled={cancellingInProgress}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-100 transition disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => handleCancelBooking(cancellingId)}
                disabled={cancellingInProgress}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {cancellingInProgress ? "Cancelling..." : "Yes, Cancel Reservation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Booking Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Reschedule Reservation
                </h3>
                <p className="text-xs text-text-secondary">
                  Ref: {reschedulingBooking.bookingReference} —{" "}
                  {reschedulingBooking.workspace?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingBooking(null)}
                className="p-1 rounded text-text-secondary hover:text-text-primary"
              >
                <FiXCircle className="size-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <FiAlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              {/* New Date */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  New Booking Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={rescheduleForm.newBookingDate}
                  onChange={(e) =>
                    setRescheduleForm((prev) => ({
                      ...prev,
                      newBookingDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Booking Type */}
              {(() => {
                const normPricing = reschedulingBooking.workspace
                  ? normalizeWorkspacePricing(reschedulingBooking.workspace)
                  : null;
                let hourlyEnabled = normPricing?.hourly?.enabled ?? true;
                let dailyEnabled = normPricing?.daily?.enabled ?? true;
                if (!hourlyEnabled && !dailyEnabled) {
                  hourlyEnabled = true;
                  dailyEnabled = true;
                }

                if (hourlyEnabled && dailyEnabled) {
                  return (
                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Access Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setRescheduleForm((prev) => ({
                              ...prev,
                              newBookingType: "hourly",
                            }))
                          }
                          className={`py-2 text-xs font-medium rounded-lg border transition ${rescheduleForm.newBookingType === "hourly"
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-border text-text-secondary hover:bg-slate-50"
                            }`}
                        >
                          Hourly Access
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRescheduleForm((prev) => ({
                              ...prev,
                              newBookingType: "full-day",
                            }))
                          }
                          className={`py-2 text-xs font-medium rounded-lg border transition ${rescheduleForm.newBookingType === "full-day"
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-border text-text-secondary hover:bg-slate-50"
                            }`}
                        >
                          Full Day Access
                        </button>
                      </div>
                    </div>
                  );
                }

                if (hourlyEnabled) {
                  return (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-border text-xs text-text-primary font-medium flex items-center justify-between">
                      <span>Access Type:</span>
                      <span className="font-semibold text-primary">Hourly Access Only</span>
                    </div>
                  );
                }

                if (dailyEnabled) {
                  return (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-border text-xs text-text-primary font-medium flex items-center justify-between">
                      <span>Access Type:</span>
                      <span className="font-semibold text-primary">Full Day Access Only</span>
                    </div>
                  );
                }

                return null;
              })()}

              {/* Hourly controls */}
              {rescheduleForm.newBookingType === "hourly" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={rescheduleForm.newStartTime}
                      onChange={(e) =>
                        setRescheduleForm((prev) => ({
                          ...prev,
                          newStartTime: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Duration (Hours)
                    </label>
                    <select
                      value={rescheduleForm.newDuration}
                      onChange={(e) =>
                        setRescheduleForm((prev) => ({
                          ...prev,
                          newDuration: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                        <option key={h} value={h}>
                          {h} {h === 1 ? "hour" : "hours"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Updated Price */}
              {recalculatedPrice && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-border px-3.5 py-2.5 text-xs">
                  <span className="font-semibold text-text-secondary">Updated Price:</span>
                  <span className="text-primary text-base font-bold">
                    ₹{recalculatedPrice.total.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Reason for Rescheduling (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Change in meeting schedule, urgent client call..."
                  value={rescheduleForm.reason}
                  onChange={(e) =>
                    setRescheduleForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setReschedulingBooking(null)}
                  disabled={rescheduleLoading}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-xs disabled:opacity-50"
                >
                  {rescheduleLoading
                    ? "Validating & Rescheduling..."
                    : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

