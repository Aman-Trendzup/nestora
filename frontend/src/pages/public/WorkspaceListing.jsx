
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

/* ----------------------------------
   SAMPLE WORKSPACE DATA
---------------------------------- */

const workspaces = [
  {
    id: 1,
    name: "The Executive Workspace",
    slug: "the-executive-workspace",
    location: "Gurugram",
    area: "Cyber City",
    type: "coworking",
    typeLabel: "Coworking Space",
    price: 499,
    priceUnit: "hour",
    capacity: 1,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Coffee", "Power Backup"],
  },
  {
    id: 2,
    name: "The Private Suite",
    slug: "the-private-suite",
    location: "Gurugram",
    area: "Golf Course Road",
    type: "private-office",
    typeLabel: "Private Office",
    price: 1499,
    priceUnit: "hour",
    capacity: 6,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Meeting Table", "AC"],
  },
  {
    id: 3,
    name: "The Meeting Studio",
    slug: "the-meeting-studio",
    location: "Delhi",
    area: "Connaught Place",
    type: "meeting-room",
    typeLabel: "Meeting Room",
    price: 899,
    priceUnit: "hour",
    capacity: 8,
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Display Screen", "Whiteboard"],
  },
  {
    id: 4,
    name: "The Dedicated Desk",
    slug: "the-dedicated-desk",
    location: "Noida",
    area: "Sector 62",
    type: "dedicated-desk",
    typeLabel: "Dedicated Desk",
    price: 299,
    priceUnit: "hour",
    capacity: 1,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Power Backup", "Coffee"],
  },
  {
    id: 5,
    name: "The Collaboration Room",
    slug: "the-collaboration-room",
    location: "Bengaluru",
    area: "Indiranagar",
    type: "meeting-room",
    typeLabel: "Meeting Room",
    price: 1199,
    priceUnit: "hour",
    capacity: 10,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "Display Screen", "Video Conferencing"],
  },
  {
    id: 6,
    name: "The Team Office",
    slug: "the-team-office",
    location: "Mumbai",
    area: "Andheri East",
    type: "private-office",
    typeLabel: "Private Office",
    price: 1999,
    priceUnit: "hour",
    capacity: 8,
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85",
    amenities: ["Wi-Fi", "AC", "Reception"],
  },
];

/* ----------------------------------
   FILTER OPTIONS
---------------------------------- */

const typeOptions = [
  { label: "All workspace types", value: "" },
  { label: "Coworking Spaces", value: "coworking" },
  { label: "Dedicated Desks", value: "dedicated-desk" },
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

const today = new Date().toLocaleDateString("en-CA");

/* ----------------------------------
   HELPER FUNCTIONS
---------------------------------- */

function normalizeType(value) {
  const typeMap = {
    "any workspace": "",
    "coworking desk": "coworking",
    "coworking spaces": "coworking",
    "private office": "private-office",
    "meeting room": "meeting-room",
    "conference room": "conference-room",
  };

  const normalized = value?.trim().toLowerCase();

  return typeMap[normalized] ?? normalized ?? "";
}

function formatDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

/* ----------------------------------
   REUSABLE FILTER SECTION
---------------------------------- */

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-border py-5 last:border-b-0">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        {title}
      </h3>

      {children}
    </div>
  );
}

/* ----------------------------------
   WORKSPACE LISTING PAGE
---------------------------------- */

export default function WorkspaceListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [sortBy, setSortBy] = useState("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* Read URL parameters */

  const location = searchParams.get("location") || "";

  const type = normalizeType(searchParams.get("type") || "");

  const date = searchParams.get("date") || "";

  const time = searchParams.get("time") || "09:00";

  const duration = searchParams.get("duration") || "2";

  const guests = searchParams.get("guests") || "";

  const minPrice = searchParams.get("minPrice") || "";

  const maxPrice = searchParams.get("maxPrice") || "";

  const selectedAmenities = (
    searchParams.get("amenities") || ""
  )
    .split(",")
    .filter(Boolean);

  /* Update URL filters */

  function updateFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams);
  }

  /* Toggle amenities */

  function toggleAmenity(amenity) {
    const nextAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((item) => item !== amenity)
      : [...selectedAmenities, amenity];

    updateFilter("amenities", nextAmenities.join(","));
  }

  /* Clear filters */

  function clearFilters() {
    setSearchParams({});
    setSortBy("recommended");
  }

  /* Check active filters */

  const hasFilters = Boolean(
    location ||
      type ||
      date ||
      searchParams.get("time") ||
      searchParams.get("duration") ||
      guests ||
      minPrice ||
      maxPrice ||
      selectedAmenities.length
  );

  const activeFilterCount = [
    location,
    type,
    date,
    searchParams.get("time"),
    searchParams.get("duration"),
    guests,
    minPrice,
    maxPrice,
    ...selectedAmenities,
  ].filter(Boolean).length;

  /* Apply filters */

  const filteredWorkspaces = useMemo(() => {
    let results = workspaces.filter((workspace) => {
      const searchLocation = location.trim().toLowerCase();

      const matchesLocation =
        !searchLocation ||
        workspace.location.toLowerCase().includes(searchLocation) ||
        workspace.area.toLowerCase().includes(searchLocation);

      const matchesType = !type || workspace.type === type;

      const guestCount = Number(guests || 0);

      const matchesGuests =
        !guestCount || workspace.capacity >= guestCount;

      const matchesMinPrice =
        !minPrice || workspace.price >= Number(minPrice);

      const matchesMaxPrice =
        !maxPrice || workspace.price <= Number(maxPrice);

      const matchesAmenities = selectedAmenities.every((amenity) =>
        workspace.amenities.includes(amenity)
      );

      return (
        matchesLocation &&
        matchesType &&
        matchesGuests &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesAmenities
      );
    });

    /* Sorting */

    if (sortBy === "price-low") {
      results = [...results].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      results = [...results].sort((a, b) => b.price - a.price);
    }

    return results;
  }, [
    location,
    type,
    guests,
    minPrice,
    maxPrice,
    selectedAmenities,
    sortBy,
  ]);

  /* ----------------------------------
     DESKTOP FILTER CONTENT
  ---------------------------------- */

  const filterContent = (
    <>
      <FilterSection title="Workspace type">
        <div className="space-y-3">
          {typeOptions.map((option) => (
            <label
              key={option.value || "all"}
              className="flex cursor-pointer items-center gap-3 text-sm text-text-secondary"
            >
              <input
                type="radio"
                name="workspace-type"
                checked={type === option.value}
                onChange={() => updateFilter("type", option.value)}
                className="size-4 accent-primary"
              />

              {option.label}
            </label>
          ))}
        </div>
      </FilterSection>


      <FilterSection title="Minimum capacity">
        <select
          value={guests}
          onChange={(event) => updateFilter("guests", event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
        >
          <option value="">Any capacity</option>
          <option value="1">1+ people</option>
          <option value="2">2+ people</option>
          <option value="4">4+ people</option>
          <option value="6">6+ people</option>
          <option value="8">8+ people</option>
        </select>
      </FilterSection>

      <FilterSection title="Amenities">
        <div className="space-y-3">
          {amenityOptions.map((amenity) => (
            <label
              key={amenity}
              className="flex cursor-pointer items-center gap-3 text-sm text-text-secondary"
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="size-4 rounded accent-primary"
              />

              {amenity}
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );

  /* ----------------------------------
     PAGE UI
  ---------------------------------- */

  return (
    <main className="min-h-screen bg-background">
      {/* PAGE HEADING */}

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Find your space
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                Explore Workspaces
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                Find the right space to focus, collaborate and get things
                done. Explore flexible workspaces designed around your needs.
              </p>
            </div>

            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">
                {filteredWorkspaces.length}
              </span>{" "}
              workspaces found
            </p>
          </div>
        </div>
      </section>

      {/* BOOKING SEARCH PANEL */}

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-text-primary">
              Refine your search
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              Choose when and where you need a workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr]">
            {/* LOCATION */}

            <div>
              <label
                htmlFor="search-location"
                className="mb-2 block text-xs font-semibold text-text-primary"
              >
                Location
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="size-4"
                  >
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>

                <input
                  id="search-location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    updateFilter("location", event.target.value)
                  }
                  placeholder="City or area"
                  className="w-full rounded-md border border-border bg-surface py-3 pl-10 pr-3 text-sm text-text-primary outline-none transition focus:border-primary"
                />
              </div>
            </div>

            {/* DATE */}

            <div>
              <label
                htmlFor="booking-date"
                className="mb-2 block text-xs font-semibold text-text-primary"
              >
                Booking date
              </label>

              <input
                id="booking-date"
                type="date"
                min={today}
                value={date}
                onChange={(event) => updateFilter("date", event.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>

            {/* START TIME */}

            <div>
              <label
                htmlFor="booking-time"
                className="mb-2 block text-xs font-semibold text-text-primary"
              >
                Start time
              </label>

              <input
                id="booking-time"
                type="time"
                value={time}
                disabled={duration === "full-day"}
                onChange={(event) => updateFilter("time", event.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary"
              />
            </div>

            {/* DURATION */}

            <div>
              <label
                htmlFor="booking-duration"
                className="mb-2 block text-xs font-semibold text-text-primary"
              >
                Duration
              </label>

              <select
                id="booking-duration"
                value={duration}
                onChange={(event) => {
                  const value = event.target.value;

                  const nextParams = new URLSearchParams(searchParams);

                  nextParams.set("duration", value);

                  if (value === "full-day") {
                    nextParams.delete("time");
                  } else if (!nextParams.get("time")) {
                    nextParams.set("time", "09:00");
                  }

                  setSearchParams(nextParams);
                }}
                className="w-full rounded-md border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none focus:border-primary"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="full-day">Full day</option>
              </select>
            </div>

            {/* GUESTS */}

            <div>
              <label
                htmlFor="booking-guests"
                className="mb-2 block text-xs font-semibold text-text-primary"
              >
                Guests
              </label>

              <select
                id="booking-guests"
                value={guests}
                onChange={(event) =>
                  updateFilter("guests", event.target.value)
                }
                className="w-full rounded-md border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none focus:border-primary"
              >
                <option value="">Any</option>
                <option value="1">1 person</option>
                <option value="2">2 people</option>
                <option value="4">4 people</option>
                <option value="6">6 people</option>
                <option value="8">8+ people</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-text-secondary">
              Your search preferences are saved in the page URL.
            </p>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-background lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="size-4"
              >
                <path d="M4 6h16M7 12h10m-7 6h4" />
              </svg>

              More filters

              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* MAIN LISTING */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* DESKTOP FILTER SIDEBAR */}

          <aside className="hidden h-fit rounded-xl border border-border bg-surface px-5 lg:block">
            <div className="flex items-center justify-between border-b border-border py-5">
              <div>
                <h2 className="font-semibold text-text-primary">
                  Filters
                </h2>

                <p className="mt-1 text-xs text-text-secondary">
                  Refine your results
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-primary hover:text-primary-hover"
              >
                Clear all
              </button>
            </div>

            {filterContent}

            <div className="pb-5">
              <p className="text-xs leading-5 text-text-secondary">
                Date and time preferences are selected above. Real-time
                availability will be confirmed when booking services are
                connected.
              </p>
            </div>
          </aside>

          {/* MOBILE FILTER PANEL */}

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/40 lg:hidden">
              <div className="flex h-full w-full max-w-sm flex-col bg-surface shadow-xl">
                <div className="flex items-center justify-between border-b border-border p-5">
                  <div>
                    <h2 className="font-semibold text-text-primary">
                      Filters
                    </h2>

                    <p className="mt-1 text-xs text-text-secondary">
                      Refine your workspace search
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="rounded-md p-2 text-text-secondary hover:bg-background"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5">
                  {filterContent}
                </div>

                <div className="flex gap-3 border-t border-border p-5">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 rounded-md border border-border px-4 py-3 text-sm font-semibold text-text-primary"
                  >
                    Clear all
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    Show {filteredWorkspaces.length} results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESULTS AREA */}

          <div className="min-w-0">
            {/* RESULTS TOOLBAR */}

            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Workspaces for you
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Showing {filteredWorkspaces.length} of {workspaces.length}{" "}
                  workspaces
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label
                  htmlFor="sort-workspaces"
                  className="shrink-0 text-sm text-text-secondary"
                >
                  Sort by
                </label>

                <select
                  id="sort-workspaces"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-w-0 rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* BOOKING SUMMARY */}

            {(date || duration || guests) && (
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-text-secondary">
                {date && (
                  <span>
                    <strong className="text-text-primary">Date:</strong>{" "}
                    {formatDate(date)}
                  </span>
                )}

                {duration && (
                  <span>
                    <strong className="text-text-primary">Duration:</strong>{" "}
                    {duration === "full-day" ? "Full day" : `${duration} hours`}
                  </span>
                )}

                {duration !== "full-day" && time && (
                  <span>
                    <strong className="text-text-primary">Start:</strong>{" "}
                    {time}
                  </span>
                )}

                {guests && (
                  <span>
                    <strong className="text-text-primary">Guests:</strong>{" "}
                    {guests === "8" ? "8+" : guests}
                  </span>
                )}
              </div>
            )}

            {/* ACTIVE FILTER CHIPS */}

            {hasFilters && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {location && (
                  <button
                    type="button"
                    onClick={() => updateFilter("location", "")}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-primary"
                  >
                    {location} <span className="ml-1">×</span>
                  </button>
                )}

                {type && (
                  <button
                    type="button"
                    onClick={() => updateFilter("type", "")}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-primary"
                  >
                    {typeOptions.find((item) => item.value === type)?.label ||
                      type}{" "}
                    <span className="ml-1">×</span>
                  </button>
                )}

                {date && (
                  <button
                    type="button"
                    onClick={() => updateFilter("date", "")}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-primary"
                  >
                    {formatDate(date)} <span className="ml-1">×</span>
                  </button>
                )}

                {guests && (
                  <button
                    type="button"
                    onClick={() => updateFilter("guests", "")}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-primary"
                  >
                    {guests}+ guests <span className="ml-1">×</span>
                  </button>
                )}

                {minPrice && (
                  <button
                    type="button"
                    onClick={() => updateFilter("minPrice", "")}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-primary"
                  >
                    Min ₹{minPrice} <span className="ml-1">×</span>
                  </button>
                )}

                {maxPrice && (
                  <button
                    type="button"
                    onClick={() => updateFilter("maxPrice", "")}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-primary"
                  >
                    Max ₹{maxPrice} <span className="ml-1">×</span>
                  </button>
                )}

                {selectedAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:border-primary"
                  >
                    {amenity} <span className="ml-1">×</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-2 py-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* WORKSPACE CARDS */}

            {filteredWorkspaces.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
                {filteredWorkspaces.map((workspace) => (
                  <article
                    key={workspace.id}
                    className="group overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:shadow-md"
                  >
                    <Link
                      to={`/workspaces/${workspace.slug}`}
                      className="block"
                      aria-label={`View ${workspace.name}`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-background">
                        <img
                          src={workspace.image}
                          alt={workspace.name}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <span className="absolute left-3 top-3 rounded-md bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm">
                          {workspace.typeLabel}
                        </span>
                      </div>
                    </Link>

                    <div className="p-4 sm:p-5">
                      <p className="text-xs font-medium text-text-secondary">
                        {workspace.area}, {workspace.location}
                      </p>

                      <Link
                        to={`/workspaces/${workspace.slug}`}
                        className="mt-2 block"
                      >
                        <h3 className="text-lg font-semibold text-text-primary transition-colors group-hover:text-primary">
                          {workspace.name}
                        </h3>
                      </Link>

                      <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="size-4 shrink-0"
                        >
                          <circle cx="9" cy="8" r="3" />
                          <path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1" />
                        </svg>

                        Capacity: {workspace.capacity}{" "}
                        {workspace.capacity === 1 ? "person" : "people"}
                      </div>

                      <div className="mt-4 flex min-h-14 flex-wrap content-start gap-2">
                        {workspace.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="rounded-md bg-background px-2.5 py-1.5 text-xs text-text-secondary"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
                        <div>
                          <p className="text-xs text-text-secondary">
                            Starting from
                          </p>

                          <p className="mt-1 text-xl font-bold text-text-primary">
                            {formatPrice(workspace.price)}
                            <span className="ml-1 text-xs font-normal text-text-secondary">
                              / hour
                            </span>
                          </p>
                        </div>

                        <Link
                          to={`/workspaces/${workspace.slug}`}
                          className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* EMPTY STATE */

              <div className="rounded-xl border border-border bg-surface px-5 py-16 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background text-text-secondary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="size-7"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m16 16 4 4M8 11h6" />
                  </svg>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-text-primary">
                  No workspaces found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
                  We couldn't find any workspaces matching your filters.
                  Try adjusting your location, budget, capacity or amenities.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
