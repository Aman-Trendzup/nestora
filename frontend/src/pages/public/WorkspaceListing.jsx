import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiSliders,
  FiX,
  FiSearch,
  FiUsers,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";
import {
  getFormattedPricingDisplay,
  getCategoryUnitLabel,
} from "../../utils/pricingCalculator";
import { getImageUrl } from "../../utils/imageHelper";
import API_BASE_URL from "../../utils/apiConfig";

/* ----------------------------------
   API CONFIGURATION
---------------------------------- */

const WORKSPACE_API = `${API_BASE_URL}/api/workspaces/search`;

/* ----------------------------------
   FILTER OPTIONS
---------------------------------- */

const typeOptions = [
  { label: "All workspace types", value: "" },
  { label: "Coworking Spaces", value: "coworking" },
  { label: "Private Offices", value: "private-office" },
  { label: "Meeting Rooms", value: "meeting-room" },
  { label: "Conference Rooms", value: "conference-room" },
];

const amenityOptions = [
  "Wi-Fi",
  "Coffee",
  "Power Backup",
  "AC",
  "Parking",
  "Meeting Table",
  "Display Screen",
  "Whiteboard",
  "Pantry",
  "Reception",
];

const durationOptions = [
  { label: "1 hour", value: "1" },
  { label: "2 hours", value: "2" },
  { label: "3 hours", value: "3" },
  { label: "4 hours", value: "4" },
  { label: "5 hours", value: "5" },
  { label: "6 hours", value: "6" },
  { label: "Full day", value: "full-day" },
];

const capacityOptions = [
  { label: "Any capacity", value: "" },
  { label: "1+ person", value: "1" },
  { label: "2+ people", value: "2" },
  { label: "4+ people", value: "4" },
  { label: "6+ people", value: "6" },
  { label: "8+ people", value: "8" },
];

const today = new Date().toLocaleDateString("en-CA");

/* ----------------------------------
   HELPER FUNCTIONS
---------------------------------- */

function normalizeType(value) {
  const typeMap = {
    "any workspace": "",
    "coworking desk": "coworking",
    "coworking space": "coworking",
    "coworking spaces": "coworking",
    "coworking": "coworking",
    "private office": "private-office",
    "private offices": "private-office",
    "private-office": "private-office",
    "meeting room": "meeting-room",
    "meeting rooms": "meeting-room",
    "meeting-room": "meeting-room",
    "conference room": "conference-room",
    "conference rooms": "conference-room",
    "conference-room": "conference-room",
  };

  const normalized = value?.trim().toLowerCase();
  return typeMap[normalized] ?? normalized ?? "";
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatPrice(amount) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "₹0";
  }
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function getTypeLabel(type) {
  return (
    typeOptions.find((option) => option.value === type)?.label.replace(
      /s$/,
      ""
    ) ||
    type ||
    "Workspace"
  );
}

/* ----------------------------------
   NORMALIZE BACKEND DATA
---------------------------------- */

function normalizeWorkspace(workspace) {
  const address = workspace.address || {};
  const firstImage = workspace.images?.[0];

  const areaStr = address.area || workspace.area || "";
  const cityStr = address.city || workspace.location || "";
  const addressText =
    [areaStr, cityStr].filter(Boolean).join(", ") ||
    address.fullAddress ||
    "Location on request";

  const pricingDisplay = getFormattedPricingDisplay(workspace);
  const unitLabel = getCategoryUnitLabel(workspace.type);

  return {
    id: workspace._id || workspace.id,
    name: workspace.name || "Untitled Workspace",
    slug: workspace.slug,
    addressText,
    area: areaStr,
    city: cityStr,
    type: workspace.type || "",
    typeLabel: getTypeLabel(workspace.type),
    unitLabel,
    pricingDisplay,
    hourlyPrice: pricingDisplay.hourlyPrice,
    fullDayPrice: pricingDisplay.dailyPrice,
    hourlyEnabled: pricingDisplay.hourlyEnabled,
    dailyEnabled: pricingDisplay.dailyEnabled,
    capacity: Number(workspace.capacity || 1),
    image: getImageUrl(firstImage || workspace.image),
    amenities: Array.isArray(workspace.amenities) ? workspace.amenities : [],
  };
}

/* ----------------------------------
   MAIN WORKSPACE LISTING COMPONENT
---------------------------------- */

export default function WorkspaceListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sort and pagination states
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreFiltersModal, setShowMoreFiltersModal] = useState(false);

  // Backend data states
  const [workspaces, setWorkspaces] = useState([]);
  const [totalWorkspaces, setTotalWorkspaces] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ----------------------------------
     READ URL PARAMETERS
  ---------------------------------- */

  const location = searchParams.get("location") || "";
  const type = normalizeType(searchParams.get("type") || "");
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "09:00";
  const duration = searchParams.get("duration") || "2";
  const guests = searchParams.get("guests") || "";
  const selectedAmenities = (searchParams.get("amenities") || "")
    .split(",")
    .filter(Boolean);

  // Temporary state for the "More Filters" modal before applying
  const [tempGuests, setTempGuests] = useState(guests);
  const [tempAmenities, setTempAmenities] = useState(selectedAmenities);

  // Keep modal temp state synced with URL params when modal opens
  const openMoreFilters = () => {
    setTempGuests(guests);
    setTempAmenities(selectedAmenities);
    setShowMoreFiltersModal(true);
  };

  /* ----------------------------------
     UPDATE URL FILTERS
  ---------------------------------- */

  function updateFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams);
    setCurrentPage(1);
  }

  function clearAllFilters() {
    setSearchParams(new URLSearchParams());
    setTempGuests("");
    setTempAmenities([]);
    setCurrentPage(1);
  }

  function handleApplyMoreFilters() {
    const nextParams = new URLSearchParams(searchParams);

    if (tempGuests) {
      nextParams.set("guests", tempGuests);
    } else {
      nextParams.delete("guests");
    }

    if (tempAmenities.length > 0) {
      nextParams.set("amenities", tempAmenities.join(","));
    } else {
      nextParams.delete("amenities");
    }

    setSearchParams(nextParams);
    setShowMoreFiltersModal(false);
    setCurrentPage(1);
  }

  function handleResetMoreFilters() {
    setTempGuests("");
    setTempAmenities([]);
  }

  // Count active filters in the "More Filters" modal
  const moreFiltersActiveCount = (guests ? 1 : 0) + selectedAmenities.length;

  // Total active filter chips count
  const hasFilters = Boolean(
    location || type || date || guests || selectedAmenities.length > 0
  );

  /* ----------------------------------
     FETCH WORKSPACES FROM BACKEND
  ---------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWorkspaces() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (location.trim()) {
          params.set("location", location.trim());
        }

        if (type) {
          params.set("type", type);
        }

        if (guests) {
          params.set("minCapacity", guests);
        }

        if (selectedAmenities.length > 0) {
          params.set("amenities", selectedAmenities.join(","));
        }

        params.set("sort", sortBy);
        params.set("page", String(currentPage));
        params.set("limit", "12");

        const response = await fetch(
          `${WORKSPACE_API}?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Unable to fetch workspaces. Server returned status ${response.status}.`
          );
        }

        const data = await response.json();
        const workspaceData =
          data.workspaces || data.data?.workspaces || [];

        if (!Array.isArray(workspaceData)) {
          throw new Error("Invalid workspace data format received.");
        }

        const normalized = workspaceData.map(normalizeWorkspace);
        setWorkspaces(normalized);
        setTotalWorkspaces(
          data.totalWorkspaces ?? data.count ?? normalized.length
        );
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Workspace fetch error:", err);
        setError(
          err.message ||
            "Something went wrong while loading workspaces. Please try again."
        );
        setWorkspaces([]);
        setTotalWorkspaces(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchWorkspaces();

    return () => controller.abort();
  }, [
    location,
    type,
    guests,
    selectedAmenities.join(","),
    sortBy,
    currentPage,
  ]);

  /* ----------------------------------
     LOCAL SORT FALLBACK
  ---------------------------------- */

  const displayWorkspaces = useMemo(() => {
    const list = [...workspaces];
    const isFullDay = duration === "full-day";

    if (sortBy === "price-low") {
      list.sort((a, b) => {
        const priceA = isFullDay ? a.fullDayPrice : a.hourlyPrice;
        const priceB = isFullDay ? b.fullDayPrice : b.hourlyPrice;
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      list.sort((a, b) => {
        const priceA = isFullDay ? a.fullDayPrice : a.hourlyPrice;
        const priceB = isFullDay ? b.fullDayPrice : b.hourlyPrice;
        return priceB - priceA;
      });
    }

    return list;
  }, [workspaces, sortBy, duration]);

  return (
    <main className="min-h-screen bg-background text-text-primary selection:bg-primary/20">
      {/* ========================================================
          TOP HORIZONTAL SEARCH & FILTER BAR (BookMyCoworking Style)
         ======================================================== */}
      <section className="border-b border-border bg-surface py-5 shadow-xs sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-surface p-3 sm:p-4 shadow-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
              {/* 1. LOCATION */}
              <div>
                <label
                  htmlFor="filter-location"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  <FiMapPin className="size-3.5 text-primary" />
                  <span>Location</span>
                </label>
                <div className="relative">
                  <input
                    id="filter-location"
                    type="text"
                    value={location}
                    onChange={(e) => updateFilter("location", e.target.value)}
                    placeholder="City or locality"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition focus:border-primary"
                  />
                  {location && (
                    <button
                      type="button"
                      onClick={() => updateFilter("location", "")}
                      aria-label="Clear location"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      <FiX className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. WORKSPACE TYPE */}
              <div>
                <label
                  htmlFor="filter-type"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  <FiSearch className="size-3.5 text-primary" />
                  <span>Workspace Type</span>
                </label>
                <select
                  id="filter-type"
                  value={type}
                  onChange={(e) => updateFilter("type", e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. BOOKING DATE */}
              <div>
                <label
                  htmlFor="filter-date"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  <FiCalendar className="size-3.5 text-primary" />
                  <span>Booking Date</span>
                </label>
                <input
                  id="filter-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => updateFilter("date", e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary"
                />
              </div>

              {/* 4. START TIME */}
              <div>
                <label
                  htmlFor="filter-time"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  <FiClock className="size-3.5 text-primary" />
                  <span>Start Time</span>
                </label>
                <input
                  id="filter-time"
                  type="time"
                  value={time}
                  disabled={duration === "full-day"}
                  onChange={(e) => updateFilter("time", e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary/60"
                />
              </div>

              {/* 5. DURATION */}
              <div>
                <label
                  htmlFor="filter-duration"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  <FiClock className="size-3.5 text-primary" />
                  <span>Duration</span>
                </label>
                <select
                  id="filter-duration"
                  value={duration}
                  onChange={(e) => {
                    const val = e.target.value;
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.set("duration", val);
                    if (val === "full-day") {
                      nextParams.delete("time");
                    } else if (!nextParams.get("time")) {
                      nextParams.set("time", "09:00");
                    }
                    setSearchParams(nextParams);
                  }}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
                >
                  {durationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. MORE FILTERS (Capacity & Amenities in Modal) */}
              <div>
                <button
                  type="button"
                  onClick={openMoreFilters}
                  className={`flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                    moreFiltersActiveCount > 0
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-text-primary hover:bg-background"
                  }`}
                >
                  <FiSliders className="size-4" />
                  <span>More Filters</span>
                  {moreFiltersActiveCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {moreFiltersActiveCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          MORE FILTERS MODAL (Minimum Capacity & Amenities)
         ======================================================== */}
      {showMoreFiltersModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setShowMoreFiltersModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  More Filters
                </h3>
                <p className="text-xs text-text-secondary">
                  Refine by team capacity and required amenities
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreFiltersModal(false)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-text-secondary hover:bg-background hover:text-text-primary transition"
              >
                <FiX className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-6">
              {/* Minimum Capacity */}
              <div>
                <label
                  htmlFor="more-filter-guests"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                >
                  Minimum Capacity / Team Size
                </label>
                <select
                  id="more-filter-guests"
                  value={tempGuests}
                  onChange={(e) => setTempGuests(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                >
                  {capacityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amenities */}
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Amenities & Facilities
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  {amenityOptions.map((amenity) => {
                    const isChecked = tempAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition ${
                          isChecked
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-surface text-text-secondary hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setTempAmenities((prev) =>
                                prev.filter((a) => a !== amenity)
                              );
                            } else {
                              setTempAmenities((prev) => [...prev, amenity]);
                            }
                          }}
                          className="size-4 rounded accent-primary"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-background/50 rounded-b-xl">
              <button
                type="button"
                onClick={handleResetMoreFilters}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary transition"
              >
                Reset filters
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMoreFiltersModal(false)}
                  className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-background transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyMoreFilters}
                  className="rounded-md bg-primary px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RESULTS SUB-HEADER & SORTING BAR
         ======================================================== */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              Workspaces {location ? `in "${location}"` : "for you"}
            </h1>
            <p className="mt-0.5 text-xs text-text-secondary">
              Showing {loading ? "..." : displayWorkspaces.length} of{" "}
              {totalWorkspaces} verified workspaces
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="sort-select"
              className="text-xs font-semibold uppercase tracking-wider text-text-secondary shrink-0"
            >
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary outline-none focus:border-primary shadow-xs"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-secondary">
              Active:
            </span>

            {location && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-primary shadow-xs">
                <span>Location: {location}</span>
                <button
                  type="button"
                  onClick={() => updateFilter("location", "")}
                  className="hover:text-primary"
                >
                  <FiX className="size-3" />
                </button>
              </span>
            )}

            {type && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-primary shadow-xs">
                <span>{getTypeLabel(type)}</span>
                <button
                  type="button"
                  onClick={() => updateFilter("type", "")}
                  className="hover:text-primary"
                >
                  <FiX className="size-3" />
                </button>
              </span>
            )}

            {date && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-primary shadow-xs">
                <span>Date: {formatDate(date)}</span>
                <button
                  type="button"
                  onClick={() => updateFilter("date", "")}
                  className="hover:text-primary"
                >
                  <FiX className="size-3" />
                </button>
              </span>
            )}

            {guests && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-primary shadow-xs">
                <span>Min {guests}+ guests</span>
                <button
                  type="button"
                  onClick={() => updateFilter("guests", "")}
                  className="hover:text-primary"
                >
                  <FiX className="size-3" />
                </button>
              </span>
            )}

            {selectedAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-primary shadow-xs"
              >
                <span>{amenity}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = selectedAmenities.filter((a) => a !== amenity);
                    updateFilter("amenities", next.join(","));
                  }}
                  className="hover:text-primary"
                >
                  <FiX className="size-3" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-primary hover:text-primary-hover underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* ========================================================
          MAIN WORKSPACE RESULTS GRID (Featured Cards Style)
         ======================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          /* Loading State */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-lg border border-border bg-surface p-4 shadow-xs animate-pulse"
              >
                <div className="aspect-[4/3] rounded-md bg-slate-200" />
                <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 flex gap-2">
                  <div className="h-3 w-12 rounded bg-slate-100" />
                  <div className="h-3 w-12 rounded bg-slate-100" />
                </div>
                <div className="mt-5 flex justify-between pt-3 border-t border-border">
                  <div className="h-5 w-20 rounded bg-slate-200" />
                  <div className="h-5 w-24 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-xs">
            <h3 className="text-lg font-semibold text-text-primary">
              Unable to load workspaces
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              {error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Try again
            </button>
          </div>
        ) : displayWorkspaces.length > 0 ? (
          /* Workspace Cards Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayWorkspaces.map((workspace) => {
              const isFullDay = duration === "full-day";
              const currentPrice = isFullDay
                ? workspace.fullDayPrice
                : workspace.hourlyPrice;
              const priceUnit = isFullDay ? "day" : "hour";

              const detailsUrl = `/workspaces/${workspace.slug}?date=${encodeURIComponent(
                date
              )}&time=${encodeURIComponent(time)}&duration=${encodeURIComponent(
                duration
              )}&guests=${encodeURIComponent(guests || "1")}`;

              return (
                <article
                  key={workspace.id}
                  className="group overflow-hidden rounded-lg border border-border bg-surface shadow-xs transition-shadow hover:shadow-md flex flex-col"
                >
                  {/* Image and overlays matching FeaturedWorkspaces */}
                  <div className="relative overflow-hidden">
                    <Link
                      to={detailsUrl}
                      aria-label={`View ${workspace.name}`}
                      className="block aspect-[4/3] overflow-hidden bg-slate-100"
                    >
                      <img
                        src={workspace.image}
                        alt={workspace.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Workspace Type badge top-left */}
                    <span className="absolute left-3 top-3 rounded-md bg-text-primary px-2.5 py-1 text-xs font-semibold text-surface shadow-xs">
                      {workspace.typeLabel}
                    </span>

                    {/* Capacity badge top-right */}
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-surface/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-text-primary shadow-xs">
                      <FiUsers className="size-3 text-text-secondary" />
                      <span>{workspace.capacity}</span>
                    </span>
                  </div>

                  {/* Workspace details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={detailsUrl}>
                          <h3 className="truncate text-base font-semibold text-text-primary transition-colors group-hover:text-primary">
                            {workspace.name}
                          </h3>
                        </Link>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary truncate">
                          <FiMapPin className="size-3.5 shrink-0 text-text-secondary" />
                          <span className="truncate">{workspace.addressText}</span>
                        </p>
                      </div>
                    </div>

                    {/* Amenities list */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4 min-h-[38px]">
                      {workspace.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="flex items-center gap-1.5 text-xs text-text-secondary"
                        >
                          <span
                            className="size-1.5 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                          {amenity}
                        </span>
                      ))}
                      {workspace.amenities.length > 3 && (
                        <span className="text-xs text-text-secondary font-medium">
                          +{workspace.amenities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Price and CTA Button */}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-text-primary">
                          {isFullDay && workspace.dailyEnabled && workspace.fullDayPrice
                            ? formatPrice(workspace.fullDayPrice)
                            : workspace.hourlyPrice
                            ? formatPrice(workspace.hourlyPrice)
                            : workspace.fullDayPrice
                            ? formatPrice(workspace.fullDayPrice)
                            : "—"}
                          <span className="ml-1 text-xs font-normal text-text-secondary">
                            / {workspace.unitLabel} /{" "}
                            {isFullDay && workspace.dailyEnabled
                              ? "day"
                              : workspace.hourlyEnabled
                              ? "hr"
                              : "day"}
                          </span>
                        </p>
                      </div>

                      <Link
                        to={detailsUrl}
                        aria-label={`View workspace details for ${workspace.name}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary transition-colors hover:text-primary"
                      >
                        <span>View Workspace</span>
                        <FiArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background text-text-secondary mb-4">
              <FiSearch className="size-6 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              No workspaces found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary leading-relaxed">
              We couldn't find any approved workspaces matching your current
              filter criteria. Try adjusting your location, capacity, or amenities.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-6 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover shadow-xs"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && !loading && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition"
            >
              Previous
            </button>

            <span className="text-xs font-semibold text-text-secondary px-3">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
