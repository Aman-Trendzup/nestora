import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  FiArrowLeft,
  FiArrowRight,
  FiMapPin,
  FiUsers,
  FiWifi,
  FiCoffee,
  FiMonitor,
  FiWind,
  FiZap,
  FiShield,
  FiClock,
  FiCalendar,
  FiCheck,
  FiMinus,
  FiPlus,
  FiInfo,
} from "react-icons/fi";

/* ----------------------------------
   API CONFIGURATION
---------------------------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ----------------------------------
   AMENITY ICONS
---------------------------------- */

const amenityIcons = {
  "High-speed Wi-Fi": FiWifi,
  "Coffee & Tea": FiCoffee,
  "Power Backup": FiZap,
  "Air Conditioning": FiWind,
  "Display Screen": FiMonitor,
  Whiteboard: FiMonitor,
  "Video Conferencing": FiMonitor,
  "Meeting Table": FiUsers,
  Reception: FiShield,
};

/* ----------------------------------
   HELPER FUNCTIONS
---------------------------------- */

const formatType = (type = "") =>
  type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatPrice = (amount, currency = "INR") => {
  if (amount === null || amount === undefined || amount === "") {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/*
  Current pricing assumption:

  Coworking and dedicated desks:
  Per person.

  Private offices, meeting rooms and conference rooms:
  Per workspace.

  Your current Workspace schema does not have a pricing.unit field.
  This rule can be replaced with a database-configured pricing unit later.
*/

const isPerPersonWorkspace = (type) =>
  ["coworking", "dedicated-desk"].includes(type);

/* ----------------------------------
   WORKSPACE DETAILS PAGE
---------------------------------- */

const WorkspaceDetails = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  /* ----------------------------------
     WORKSPACE API STATES
  ---------------------------------- */

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ----------------------------------
     GALLERY STATE
  ---------------------------------- */

  const [activeImage, setActiveImage] = useState(0);

  /* ----------------------------------
     BOOKING STATES
  ---------------------------------- */

  const [bookingType, setBookingType] = useState(
    searchParams.get("bookingType") === "full-day"
      ? "full-day"
      : "hourly"
  );

  const [date, setDate] = useState(
    searchParams.get("date") || getToday()
  );

  const [startTime, setStartTime] = useState(
    searchParams.get("time") || "09:00"
  );

  const [duration, setDuration] = useState(() => {
    const value = Number(searchParams.get("duration"));
    return Number.isFinite(value) && value >= 1 ? value : 2;
  });

  const [guests, setGuests] = useState(() => {
    const value = Number(searchParams.get("guests"));
    return Number.isFinite(value) && value >= 1 ? value : 1;
  });

  /* ----------------------------------
     FETCH WORKSPACE FROM BACKEND
  ---------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setError("");
        setWorkspace(null);
        setActiveImage(0);

        const response = await fetch(
          `${API_BASE_URL}/api/workspaces/${encodeURIComponent(slug)}`,
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load workspace details."
          );
        }

        if (!data.workspace) {
          throw new Error("Workspace details were not returned.");
        }

        setWorkspace(data.workspace);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchWorkspace();
    } else {
      setError("Workspace slug is missing.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [slug]);

  /* ----------------------------------
     NORMALIZE WORKSPACE IMAGES
  ---------------------------------- */

  const workspaceImages = useMemo(() => {
    if (!workspace?.images?.length) {
      return ["/images/workspace-placeholder.jpg"];
    }

    const images = workspace.images
      .map((image) =>
        typeof image === "string" ? image : image?.url
      )
      .filter(Boolean);

    return images.length
      ? images
      : ["/images/workspace-placeholder.jpg"];
  }, [workspace]);

  /* ----------------------------------
     KEEP GUESTS WITHIN CAPACITY
  ---------------------------------- */

  useEffect(() => {
    if (workspace) {
      setGuests((current) =>
        Math.min(
          Math.max(1, current),
          Math.max(1, workspace.capacity || 1)
        )
      );
    }
  }, [workspace]);

  /* ----------------------------------
     PRICING
  ---------------------------------- */

  const currency = workspace?.pricing?.currency || "INR";

  const hourlyPrice = workspace?.pricing?.hourly;

  const fullDayPrice = workspace?.pricing?.fullDay;

  const perPerson = isPerPersonWorkspace(workspace?.type);

  const price = useMemo(() => {
    if (!workspace) return null;

    if (bookingType === "full-day") {
      if (fullDayPrice === null || fullDayPrice === undefined) {
        return null;
      }

      return perPerson
        ? fullDayPrice * guests
        : fullDayPrice;
    }

    if (hourlyPrice === null || hourlyPrice === undefined) {
      return null;
    }

    const total = hourlyPrice * duration;

    return perPerson ? total * guests : total;
  }, [
    workspace,
    bookingType,
    hourlyPrice,
    fullDayPrice,
    duration,
    guests,
    perPerson,
  ]);

  /* ----------------------------------
     BOOKING VALIDATION
  ---------------------------------- */

  const validateBooking = () => {
    if (!date) {
      return "Please select a booking date.";
    }

    if (date < getToday()) {
      return "Please select today or a future date.";
    }

    if (!guests || guests < 1) {
      return "Please select at least one guest.";
    }

    if (guests > workspace.capacity) {
      return `This workspace allows a maximum of ${workspace.capacity} guests.`;
    }

    if (bookingType === "hourly") {
      if (!startTime) {
        return "Please select a start time.";
      }

      if (!duration || duration < 1 || duration > 8) {
        return "Please select a valid booking duration.";
      }

      if (hourlyPrice === null || hourlyPrice === undefined) {
        return "Hourly pricing is not available for this workspace.";
      }
    }

    if (bookingType === "full-day") {
      if (fullDayPrice === null || fullDayPrice === undefined) {
        return "Full-day pricing is not configured for this workspace yet.";
      }
    }

    return null;
  };

  /* ----------------------------------
     BOOKING HANDLER
  ---------------------------------- */

  const handleBooking = () => {
    const validationError = validateBooking();

    if (validationError) {
      window.alert(validationError);
      return;
    }

    const bookingParams = new URLSearchParams({
      date,
      bookingType,
      guests: String(guests),
      ...(bookingType === "hourly"
        ? {
            time: startTime,
            duration: String(duration),
          }
        : {}),
    });

    const redirectUrl =
      `/workspaces/${workspace.slug}?${bookingParams.toString()}`;

    window.location.href =
      `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  /* ----------------------------------
     LOADING STATE
  ---------------------------------- */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-border border-t-primary" />

          <p className="mt-4 text-sm text-text-secondary">
            Loading workspace details...
          </p>
        </div>
      </main>
    );
  }

  /* ----------------------------------
     ERROR STATE
  ---------------------------------- */

  if (error) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-slate-100 text-text-secondary">
            <FiInfo size={28} />
          </div>

          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load workspace
          </h1>

          <p className="mt-3 text-sm text-text-secondary">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-7 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Try again
          </button>

          <Link
            to="/workspaces"
            className="mt-4 block text-sm font-medium text-primary"
          >
            Back to workspaces
          </Link>
        </div>
      </main>
    );
  }

  /* ----------------------------------
     NOT FOUND STATE
  ---------------------------------- */

  if (!workspace) {
    return (
      <main className="min-h-[70vh] bg-background px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-slate-100 text-text-secondary">
            <FiMapPin size={28} />
          </div>

          <h1 className="text-2xl font-semibold text-text-primary">
            Workspace not found
          </h1>

          <p className="mt-3 text-text-secondary">
            This workspace may have been removed or the link may be incorrect.
          </p>

          <Link
            to="/workspaces"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary-hover"
          >
            <FiArrowLeft />
            Explore workspaces
          </Link>
        </div>
      </main>
    );
  }

  /* ----------------------------------
     MAIN PAGE
  ---------------------------------- */

  return (
    <main className="min-h-screen bg-background pb-16">

      {/* Breadcrumb */}

      <div className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
        <Link
          to="/workspaces"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary"
        >
          <FiArrowLeft size={15} />
          Back to workspaces
        </Link>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-medium text-primary">
              {formatType(workspace.type)}
            </span>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
              {workspace.name}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
              <FiMapPin className="shrink-0" />
              {workspace.address?.area}, {workspace.address?.city}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <FiUsers />
            Capacity: {workspace.capacity}{" "}
            {workspace.capacity === 1 ? "person" : "people"}
          </div>
        </div>
      </div>

      {/* Image Gallery */}

      <section className="mx-auto mt-7 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2">

          {/* Main Image */}

          <div className="relative h-72 overflow-hidden md:col-span-2 md:row-span-2 md:h-[440px]">
            <img
              src={workspaceImages[activeImage]}
              alt={`${workspace.name} workspace`}
              className="h-full w-full object-cover"
            />

            <span className="absolute bottom-4 left-4 rounded-md bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white">
              {activeImage + 1} / {workspaceImages.length}
            </span>
          </div>

          {/* Desktop Thumbnails */}

          {workspaceImages.slice(0, 3).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`group relative hidden h-[213px] overflow-hidden md:block ${
                activeImage === index
                  ? "ring-2 ring-primary ring-inset"
                  : ""
              }`}
              aria-label={`View workspace image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${workspace.name} view ${index + 1}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        {/* Mobile Thumbnails */}

        <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
          {workspaceImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`size-20 shrink-0 overflow-hidden rounded-lg ${
                activeImage === index ? "ring-2 ring-primary" : ""
              }`}
              aria-label={`View workspace image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Workspace thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}

      <section className="mx-auto mt-10 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">

        {/* Workspace Information */}

        <div className="min-w-0">

          {/* Overview */}

          <div className="border-b border-border pb-8">
            <h2 className="text-xl font-semibold text-text-primary">
              About this workspace
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
              {workspace.description}
            </p>

            {workspace.features?.length > 0 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {workspace.features.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
                  >
                    <span className="mt-0.5 text-primary">
                      <FiCheck size={18} />
                    </span>

                    <span className="text-sm font-medium text-text-primary">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}

          <div className="border-b border-border py-8">
            <h2 className="text-xl font-semibold text-text-primary">
              Amenities & facilities
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              Facilities available at this workspace.
            </p>

            {workspace.amenities?.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {workspace.amenities.map((amenity, index) => {
                  const Icon = amenityIcons[amenity] || FiCheck;

                  return (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-3 text-sm text-text-primary"
                    >
                      <Icon size={19} className="text-text-secondary" />
                      {amenity}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 text-sm text-text-secondary">
                No amenities have been added yet.
              </p>
            )}
          </div>

          {/* Location */}

          <div className="border-b border-border py-8">
            <h2 className="text-xl font-semibold text-text-primary">
              Location
            </h2>

            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-text-secondary">
              <FiMapPin className="mt-1 shrink-0 text-primary" />
              {workspace.address?.fullAddress}
            </p>

            {workspace.address?.landmark && (
              <p className="mt-2 pl-6 text-sm text-text-secondary">
                Near {workspace.address.landmark}
              </p>
            )}

            <div className="mt-5 flex h-48 items-center justify-center rounded-xl border border-border bg-slate-100">
              <div className="text-center">
                <FiMapPin className="mx-auto text-2xl text-text-secondary" />

                <p className="mt-2 text-sm font-medium text-text-primary">
                  {workspace.address?.area},{" "}
                  {workspace.address?.city}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  Map integration will be added later.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Information */}

          <div className="py-8">
            <h2 className="text-xl font-semibold text-text-primary">
              Before you book
            </h2>

            <div className="mt-5 space-y-4">

              <div className="flex gap-3">
                <FiClock className="mt-0.5 shrink-0 text-primary" />

                <div>
                  <h3 className="text-sm font-medium text-text-primary">
                    Booking duration
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Choose an hourly booking or a full-day booking according
                    to your requirement.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <FiInfo className="mt-0.5 shrink-0 text-primary" />

                <div>
                  <h3 className="text-sm font-medium text-text-primary">
                    Payment at the workspace
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Payment is made offline at the workspace. No online
                    payment is collected on NESTORA.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Booking Card */}

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-md sm:p-6">

            {/* Price Header */}

            <div className="flex items-start justify-between gap-3 border-b border-border pb-5">
              <div>
                <p className="text-sm text-text-secondary">
                  Starting from
                </p>

                <div className="mt-1">
                  {hourlyPrice !== null && hourlyPrice !== undefined ? (
                    <>
                      <span className="text-2xl font-bold text-text-primary">
                        {formatPrice(hourlyPrice, currency)}
                      </span>

                      <span className="ml-1 text-xs text-text-secondary">
                        / hour
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-text-secondary">
                      Contact for pricing
                    </span>
                  )}
                </div>
              </div>

              <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-primary">
                {formatType(workspace.type)}
              </span>
            </div>

            {/* Booking Type */}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Booking type
              </label>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-background p-1">

                <button
                  type="button"
                  onClick={() => setBookingType("hourly")}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    bookingType === "hourly"
                      ? "bg-surface text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Hourly
                </button>

                <button
                  type="button"
                  onClick={() => setBookingType("full-day")}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    bookingType === "full-day"
                      ? "bg-surface text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Full day
                </button>

              </div>
            </div>

            {/* Date */}

            <div className="mt-5">
              <label
                htmlFor="booking-date"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Date
              </label>

              <div className="relative">
                <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />

                <input
                  id="booking-date"
                  type="date"
                  min={getToday()}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Hourly Fields */}

            {bookingType === "hourly" && (
              <>
                <div className="mt-5">
                  <label
                    htmlFor="booking-time"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Start time
                  </label>

                  <div className="relative">
                    <FiClock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />

                    <input
                      id="booking-time"
                      type="time"
                      value={startTime}
                      onChange={(event) =>
                        setStartTime(event.target.value)
                      }
                      className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="booking-duration"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Duration
                  </label>

                  <select
                    id="booking-duration"
                    value={duration}
                    onChange={(event) =>
                      setDuration(Number(event.target.value))
                    }
                    className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                      <option key={hour} value={hour}>
                        {hour} {hour === 1 ? "hour" : "hours"}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Full Day Information */}

            {bookingType === "full-day" && (
              <div className="mt-4 rounded-lg bg-background p-3">
                <p className="text-xs leading-5 text-text-secondary">
                  Full-day booking follows the workspace's operating
                  hours. The configured full-day price will be used
                  for the estimate.
                </p>
              </div>
            )}

            {/* Guests */}

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  Guests
                </label>

                <span className="text-xs text-text-secondary">
                  Max. {workspace.capacity}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-text-secondary">
                  Number of guests
                </span>

                <div className="flex items-center gap-4">

                  <button
                    type="button"
                    disabled={guests <= 1}
                    onClick={() =>
                      setGuests((value) => Math.max(1, value - 1))
                    }
                    className="flex size-8 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease guests"
                  >
                    <FiMinus size={14} />
                  </button>

                  <span className="min-w-4 text-center text-sm font-semibold text-text-primary">
                    {guests}
                  </span>

                  <button
                    type="button"
                    disabled={guests >= workspace.capacity}
                    onClick={() =>
                      setGuests((value) =>
                        Math.min(workspace.capacity, value + 1)
                      )
                    }
                    className="flex size-8 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Increase guests"
                  >
                    <FiPlus size={14} />
                  </button>

                </div>
              </div>
            </div>

            {/* Price Summary */}

            <div className="mt-6 border-t border-border pt-5">

              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>
                  {bookingType === "hourly"
                    ? `${formatPrice(hourlyPrice, currency)} × ${duration} hours`
                    : `Full-day rate`}
                </span>

                <span>
                  {formatPrice(
                    bookingType === "hourly"
                      ? hourlyPrice
                      : fullDayPrice,
                    currency
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-text-secondary">
                <span>Guests</span>

                <span>× {guests}</span>
              </div>

              {perPerson && (
                <p className="mt-2 text-xs text-text-secondary">
                  Pricing is calculated per person.
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-semibold text-text-primary">
                  Estimated total
                </span>

                <span className="text-xl font-bold text-text-primary">
                  {price === null
                    ? "—"
                    : formatPrice(price, currency)}
                </span>
              </div>

              {price === null && (
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  The owner has not configured this booking rate yet.
                </p>
              )}
            </div>

            {/* Booking Button */}

            <button
              type="button"
              onClick={handleBooking}
              disabled={price === null}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to booking
              <FiArrowRight />
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-text-secondary">
              No online payment required. Pay at the workspace.
            </p>

          </div>
        </aside>
      </section>
    </main>
  );
};

export default WorkspaceDetails;