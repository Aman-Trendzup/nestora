import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiMapPin,
  FiUsers,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiX,
  FiSlash,
} from "react-icons/fi";
import { getFormattedPricingDisplay } from "../../utils/pricingCalculator";
import { getImageUrl } from "../../utils/imageHelper";
import API_BASE_URL from "../../utils/apiConfig";

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function OwnerWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [notification, setNotification] = useState("");

  // Blocked Dates State
  const [managingWorkspace, setManagingWorkspace] = useState(null);
  const [blockedDatesList, setBlockedDatesList] = useState([]);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState("");
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  const handleOpenBlockedDates = async (ws) => {
    setManagingWorkspace(ws);
    setBlockError("");
    setNewBlockDate("");
    setNewBlockReason("");
    try {
      setBlockLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/workspaces/${ws._id}/blocked-dates`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setBlockedDatesList(data.blockedDates || []);
      }
    } catch (err) {
      setBlockError("Failed to fetch blocked dates.");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!newBlockDate) return;
    try {
      setBlockLoading(true);
      setBlockError("");
      const res = await fetch(
        `${API_BASE_URL}/api/workspaces/${managingWorkspace._id}/blocked-dates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            date: newBlockDate,
            reason: newBlockReason || "Maintenance / Reserved by Owner",
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to block date.");
      setBlockedDatesList(data.blockedDates || []);
      setNewBlockDate("");
      setNewBlockReason("");
      setNotification(`Date ${newBlockDate} blocked successfully.`);
    } catch (err) {
      setBlockError(err.message || "Failed to block date.");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleRemoveBlockedDate = async (dateStr) => {
    try {
      setBlockLoading(true);
      setBlockError("");
      const res = await fetch(
        `${API_BASE_URL}/api/workspaces/${managingWorkspace._id}/blocked-dates/${dateStr}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to unblock date.");
      setBlockedDatesList(data.blockedDates || []);
      setNotification(`Date ${dateStr} unblocked and available.`);
    } catch (err) {
      setBlockError(err.message || "Failed to unblock date.");
    } finally {
      setBlockLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/workspaces/owner/my-workspaces`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load workspace listings.");
      }

      setWorkspaces(data.workspaces || []);
    } catch (err) {
      console.error("Fetch owner workspaces error:", err);
      setError(err.message || "Unable to load workspaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeleteInProgress(true);
      const response = await fetch(`${API_BASE_URL}/api/workspaces/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete workspace.");
      }

      setWorkspaces((prev) => prev.filter((ws) => ws._id !== id));
      setNotification("Workspace listing has been deleted successfully.");
      setDeletingId(null);
    } catch (err) {
      alert(err.message || "Delete failed.");
    } finally {
      setDeleteInProgress(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            My Workspace Listings
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your listed properties, update pricing, availability, and
            photos.
          </p>
        </div>

        <Link
          to="/owner/workspaces/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-xs transition w-fit"
        >
          <FiPlus className="size-4" />
          <span>Add New Workspace</span>
        </Link>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{notification}</span>
          <button
            onClick={() => setNotification("")}
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

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-3" />
          <p className="text-sm text-text-secondary">Loading your properties...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && workspaces.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-text-secondary mb-4">
            <FiPlus className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            No workspaces listed yet
          </h2>
          <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
            You haven't added any workspaces yet. Publish your spaces to start
            receiving bookings from verified professionals.
          </p>
          <Link
            to="/owner/workspaces/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition"
          >
            <FiPlus className="size-4" />
            <span>Add Your First Workspace</span>
          </Link>
        </div>
      )}

      {/* Workspaces Grid */}
      {!loading && !error && workspaces.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => {
            const firstImage = getImageUrl(ws.images?.[0]);

            return (
              <div
                key={ws._id}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={firstImage}
                      alt={ws.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          ws.approvalStatus === "approved"
                            ? "bg-emerald-600 text-white"
                            : ws.approvalStatus === "pending"
                            ? "bg-amber-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {ws.approvalStatus || "Active"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-semibold">
                      {getFormattedPricingDisplay(ws).formattedText}
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-base font-bold text-text-primary line-clamp-1">
                      {ws.name}
                    </h2>

                    <p className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                      <FiMapPin className="size-3.5 shrink-0 text-text-secondary" />
                      <span className="truncate">
                        {ws.address?.area
                          ? `${ws.address.area}, ${ws.address.city}`
                          : ws.address?.city || "Address on file"}
                      </span>
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-text-secondary border-t border-border pt-3">
                      <span className="flex items-center gap-1.5 capitalize">
                        <span className="size-2 rounded-full bg-primary" />
                        {ws.type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiUsers className="size-3.5 text-text-secondary" />
                        <span>Up to {ws.capacity} guests</span>
                      </span>
                    </div>

                    {/* Status Feedback Notice for Owner */}
                    {ws.approvalStatus === "pending" && (
                      <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
                        <FiClock className="size-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <p className="font-semibold text-amber-800">Pending Super Admin Review</p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            This listing is currently hidden from customers until reviewed and approved.
                          </p>
                        </div>
                      </div>
                    )}

                    {ws.approvalStatus === "rejected" && (
                      <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-900 border border-rose-200">
                        <FiAlertCircle className="size-3.5 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                          <p className="font-semibold text-rose-800">Listing Rejected by Admin</p>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            <span className="font-medium">Reason:</span> {ws.rejectionReason || "Does not meet platform guidelines."}
                          </p>
                        </div>
                      </div>
                    )}

                    {ws.approvalStatus === "approved" && (
                      <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                        <FiCheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                        <span>Live on Nestora • Receiving bookings</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border bg-slate-50/50 p-4 flex items-center justify-between gap-2">
                  <Link
                    to={`/workspaces/${ws.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Preview</span>
                    <FiExternalLink className="size-3" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenBlockedDates(ws)}
                      className="p-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-amber-600 hover:bg-amber-50 transition"
                      title="Manage Blocked Dates / Availability"
                    >
                      <FiCalendar className="size-4" />
                    </button>

                    <Link
                      to={`/owner/workspaces/edit/${ws._id}`}
                      className="p-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-primary hover:bg-slate-50 transition"
                      title="Edit Listing"
                    >
                      <FiEdit2 className="size-4" />
                    </Link>

                    <button
                      onClick={() => setDeletingId(ws._id)}
                      className="p-1.5 rounded-lg border border-border bg-surface text-text-secondary hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Listing"
                    >
                      <FiTrash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl border border-border">
            <div className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <FiAlertCircle className="size-6" />
            </div>

            <h3 className="text-lg font-bold text-text-primary">
              Delete Workspace Listing?
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Are you sure you want to delete this listing? It will no longer be
              available for customer searches or bookings.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleteInProgress}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={deleteInProgress}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
              >
                {deleteInProgress ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Blocked Dates Management Modal */}
      {managingWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Manage Blocked Dates & Availability
                </h3>
                <p className="text-xs text-text-secondary">
                  Space: {managingWorkspace.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingWorkspace(null)}
                className="p-1 rounded text-text-secondary hover:text-text-primary"
              >
                <FiX className="size-5" />
              </button>
            </div>

            {blockError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <FiAlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{blockError}</span>
              </div>
            )}

            {/* Block New Date Form */}
            <form onSubmit={handleAddBlockedDate} className="p-3.5 rounded-xl bg-slate-50 border border-border mb-5 space-y-3">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Block a Specific Date
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Date to Block
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border bg-white px-3 py-2 text-text-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Reason (e.g. Maintenance)
                  </label>
                  <input
                    type="text"
                    placeholder="Private Event / Repair"
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border bg-white px-3 py-2 text-text-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={blockLoading || !newBlockDate}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition disabled:opacity-50"
                >
                  {blockLoading ? "Saving..." : "Block Date"}
                </button>
              </div>
            </form>

            {/* Existing Blocked Dates Table */}
            <div>
              <h4 className="text-xs font-bold text-text-primary mb-2">
                Currently Blocked Dates ({blockedDatesList.length})
              </h4>
              {blockedDatesList.length === 0 ? (
                <p className="text-xs text-text-secondary py-3 text-center bg-slate-50 rounded-lg border border-dashed border-border">
                  No custom dates are blocked for this space.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {blockedDatesList.map((entry) => (
                    <div
                      key={entry.date}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface text-xs"
                    >
                      <div>
                        <span className="font-semibold text-text-primary block">
                          {entry.date}
                        </span>
                        <span className="text-text-secondary text-[11px]">
                          {entry.reason || "Unavailable"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockedDate(entry.date)}
                        disabled={blockLoading}
                        className="text-[11px] font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition disabled:opacity-50"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

