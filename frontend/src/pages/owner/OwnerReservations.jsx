import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

import API_BASE_URL from "../../utils/apiConfig";

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function OwnerReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [actionMessage, setActionMessage] = useState("");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/owner/my-reservations?limit=50`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reservations.");
      }

      setReservations(data.bookings || []);
    } catch (err) {
      console.error("Fetch owner reservations error:", err);
      setError(err.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActionMessage("");
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

      setActionMessage(`Reservation has been updated to "${newStatus}".`);
      setReservations((prev) =>
        prev.map((r) => (r._id === bookingId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err.message || "Status update error.");
    }
  };

  const filtered = reservations.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Customer Reservations
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage incoming bookings, verify professional credentials, and
            update booking statuses.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage("")}
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4 overflow-x-auto no-scrollbar">
        {[
          { key: "all", label: "All Reservations", count: reservations.length },
          {
            key: "pending",
            label: "Pending",
            count: reservations.filter((r) => r.status === "pending").length,
          },
          {
            key: "confirmed",
            label: "Confirmed",
            count: reservations.filter((r) => r.status === "confirmed").length,
          },
          {
            key: "completed",
            label: "Completed",
            count: reservations.filter((r) => r.status === "completed").length,
          },
          {
            key: "cancelled",
            label: "Cancelled / Rejected",
            count: reservations.filter((r) =>
              ["cancelled", "rejected"].includes(r.status)
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-text-secondary"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-3" />
          <p className="text-sm text-text-secondary">Loading reservations...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-text-secondary mb-4">
            <FiCalendar className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            No reservations found
          </h2>
          <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
            {activeTab === "all"
              ? "You haven't received any bookings yet. Once customers make a reservation, they will appear here."
              : `There are currently no ${activeTab} reservations.`}
          </p>
        </div>
      )}

      {/* Reservations Cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((res) => {
            const customer = res.customer || {};
            const workspace = res.workspace || {};

            return (
              <div
                key={res._id}
                className="rounded-2xl border border-border bg-surface p-6 shadow-xs transition hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Column: Customer & Workspace Info */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          res.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : res.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : res.status === "cancelled" || res.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {res.status}
                      </span>

                      {res.bookingCode && (
                        <span className="font-mono text-xs text-text-secondary bg-slate-100 px-2 py-0.5 rounded">
                          REF #{res.bookingCode}
                        </span>
                      )}

                      <span className="text-xs text-text-secondary font-medium">
                        Booked on{" "}
                        {new Date(res.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-text-primary">
                        {workspace.name || "Workspace"}
                      </h2>
                      <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                        <FiMapPin className="size-3 text-text-secondary" />
                        <span>
                          {workspace.address?.city || "Property Location"}
                        </span>
                      </p>
                    </div>

                    {/* Customer contact pill */}
                    <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-border">
                      <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                        <FiUser className="size-3.5 text-primary" />
                        <span>{customer.fullName || "Guest Customer"}</span>
                      </span>
                      {customer.email && (
                        <span className="flex items-center gap-1 text-text-secondary">
                          <FiMail className="size-3 text-text-secondary" />
                          <span>{customer.email}</span>
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1 text-text-secondary">
                          <FiPhone className="size-3 text-text-secondary" />
                          <span>{customer.phone}</span>
                        </span>
                      )}
                    </div>

                    {/* Special requests if any */}
                    {res.specialRequests && (
                      <p className="text-xs text-text-secondary bg-amber-50/60 border border-amber-100 p-2.5 rounded-lg">
                        <span className="font-semibold text-amber-800">
                          Special Request:{" "}
                        </span>
                        {res.specialRequests}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Timing, Pricing & Status Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 border-border pt-4 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <div className="flex items-center gap-1 text-xs text-text-secondary mb-1">
                        <FiCalendar className="size-3.5 text-primary" />
                        <span className="font-semibold text-text-primary">
                          {new Date(res.bookingDate).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {res.bookingType === "hourly"
                          ? `${res.startTime} - ${res.endTime} (${res.duration} hrs)`
                          : "Full Day Access"}
                        {" • "}
                        {res.guests} {res.guests === 1 ? "Guest" : "Guests"}
                      </div>
                      <p className="text-lg font-bold text-text-primary mt-2">
                        {formatPrice(res.pricing?.totalAmount)}
                      </p>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="flex items-center gap-2">
                      {res.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(res._id, "confirmed")
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                          >
                            <FiCheck className="size-3.5" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(res._id, "rejected")
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition"
                          >
                            <FiXCircle className="size-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {res.status === "confirmed" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(res._id, "completed")
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                        >
                          <FiCheckCircle className="size-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

