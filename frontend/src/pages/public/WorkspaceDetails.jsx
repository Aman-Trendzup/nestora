
import { useMemo, useState } from "react";
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

// Temporary frontend data.
// Later, this data will come from your backend API.
const workspaces = [
  {
    id: "1",
    slug: "the-executive-workspace",
    name: "The Executive Workspace",
    city: "Gurugram",
    area: "Cyber City",
    type: "coworking",
    price: 499,
    priceUnit: "per person / hour",
    capacity: 1,
    description:
      "A thoughtfully designed coworking environment for professionals who value focus, comfort and a productive atmosphere. Enjoy reliable connectivity, comfortable seating and access to essential workspace facilities.",
    address: "Cyber City, Gurugram, Haryana",
    amenities: ["High-speed Wi-Fi", "Coffee & Tea", "Power Backup", "Air Conditioning"],
    features: ["Flexible seating", "Natural lighting", "Professional environment"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
    ],
  },
  {
    id: "2",
    slug: "the-private-suite",
    name: "The Private Suite",
    city: "Gurugram",
    area: "Golf Course Road",
    type: "private-office",
    price: 1499,
    priceUnit: "per hour",
    capacity: 6,
    description:
      "A private and comfortable office designed for small teams that need their own dedicated space. Ideal for focused work, team discussions and confidential conversations.",
    address: "Golf Course Road, Gurugram, Haryana",
    amenities: ["High-speed Wi-Fi", "Meeting Table", "Air Conditioning", "Reception"],
    features: ["Private workspace", "Team seating", "Professional environment"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
    ],
  },
  {
    id: "3",
    slug: "the-meeting-studio",
    name: "The Meeting Studio",
    city: "Delhi",
    area: "Connaught Place",
    type: "meeting-room",
    price: 899,
    priceUnit: "per hour",
    capacity: 8,
    description:
      "A professional meeting space for presentations, client discussions and collaborative sessions. The room offers a comfortable setup for productive meetings.",
    address: "Connaught Place, New Delhi",
    amenities: ["High-speed Wi-Fi", "Display Screen", "Whiteboard", "Air Conditioning"],
    features: ["Presentation setup", "Meeting table", "Collaborative space"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
    ],
  },
  {
    id: "4",
    slug: "the-dedicated-desk",
    name: "The Dedicated Desk",
    city: "Noida",
    area: "Sector 62",
    type: "dedicated-desk",
    price: 299,
    priceUnit: "per person / hour",
    capacity: 1,
    description:
      "A dedicated desk for individuals looking for a consistent and comfortable place to work. Settle in, stay focused and make the most of your working day.",
    address: "Sector 62, Noida, Uttar Pradesh",
    amenities: ["High-speed Wi-Fi", "Power Backup", "Coffee & Tea", "Air Conditioning"],
    features: ["Dedicated seating", "Power access", "Quiet environment"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
    ],
  },
  {
    id: "5",
    slug: "the-collaboration-room",
    name: "The Collaboration Room",
    city: "Bengaluru",
    area: "Indiranagar",
    type: "meeting-room",
    price: 1199,
    priceUnit: "per hour",
    capacity: 10,
    description:
      "A spacious meeting room for teams that need room to think, plan and collaborate. Suitable for team meetings, workshops and presentations.",
    address: "Indiranagar, Bengaluru, Karnataka",
    amenities: ["High-speed Wi-Fi", "Display Screen", "Video Conferencing", "Whiteboard"],
    features: ["Large meeting table", "Presentation setup", "Team collaboration"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
    ],
  },
  {
    id: "6",
    slug: "the-team-office",
    name: "The Team Office",
    city: "Mumbai",
    area: "Andheri East",
    type: "private-office",
    price: 1999,
    priceUnit: "per hour",
    capacity: 8,
    description:
      "A private office for teams that need a dedicated place to work together. Designed to support focused work, team conversations and everyday productivity.",
    address: "Andheri East, Mumbai, Maharashtra",
    amenities: ["High-speed Wi-Fi", "Air Conditioning", "Reception", "Meeting Table"],
    features: ["Private office", "Team seating", "Dedicated workspace"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
      "https://images.unsplash.com/photo-1497366216548-37526070297c",
      "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
    ],
  },
];

const amenityIcons = {
  "High-speed Wi-Fi": FiWifi,
  "Coffee & Tea": FiCoffee,
  "Power Backup": FiZap,
  "Air Conditioning": FiWind,
  "Display Screen": FiMonitor,
  "Whiteboard": FiMonitor,
  "Video Conferencing": FiMonitor,
  "Meeting Table": FiUsers,
  "Reception": FiShield,
};

const formatType = (type) =>
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

const WorkspaceDetails = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  const workspace = workspaces.find((item) => item.slug === slug);

  const [activeImage, setActiveImage] = useState(0);
  const [bookingType, setBookingType] = useState(
    searchParams.get("duration") === "full-day" ? "full-day" : "hourly"
  );

  const [date, setDate] = useState(
    searchParams.get("date") || getToday()
  );

  const [startTime, setStartTime] = useState(
    searchParams.get("time") || "09:00"
  );

  const [duration, setDuration] = useState(
    Number(searchParams.get("duration")) || 2
  );

  const [guests, setGuests] = useState(
    Math.max(1, Number(searchParams.get("guests")) || 1)
  );

  const price = useMemo(() => {
    if (!workspace) return 0;

    // Full-day pricing will be supplied by the backend later.
    // For now, this is a temporary 8-hour estimate.
    const totalHours = bookingType === "full-day" ? 8 : duration;

    return workspace.price * totalHours * guests;
  }, [workspace, bookingType, duration, guests]);

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

  const handleBooking = () => {
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

    // Customer authentication and booking flow will be connected later.
    window.location.href = `/login?redirect=${encodeURIComponent(
      `/workspaces/${workspace.slug}?${bookingParams.toString()}`
    )}`;
  };

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
              {workspace.area}, {workspace.city}
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
          <div className="relative h-72 overflow-hidden md:col-span-2 md:row-span-2 md:h-[440px]">
            <img
              src={workspace.images[activeImage]}
              alt={`${workspace.name} workspace`}
              className="h-full w-full object-cover"
            />

            <span className="absolute bottom-4 left-4 rounded-md bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white">
              {activeImage + 1} / {workspace.images.length}
            </span>
          </div>

          {workspace.images.slice(0, 3).map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`group relative hidden h-[213px] overflow-hidden md:block ${
                activeImage === index ? "ring-2 ring-primary ring-inset" : ""
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

        <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
          {workspace.images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(index)}
              className={`size-20 shrink-0 overflow-hidden rounded-lg ${
                activeImage === index ? "ring-2 ring-primary" : ""
              }`}
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

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {workspace.features.map((feature) => (
                <div
                  key={feature}
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
          </div>

          {/* Amenities */}
          <div className="border-b border-border py-8">
            <h2 className="text-xl font-semibold text-text-primary">
              Amenities & facilities
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              Facilities available at this workspace.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {workspace.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || FiCheck;

                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-sm text-text-primary"
                  >
                    <Icon size={19} className="text-text-secondary" />
                    {amenity}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="border-b border-border py-8">
            <h2 className="text-xl font-semibold text-text-primary">
              Location
            </h2>

            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-text-secondary">
              <FiMapPin className="mt-1 shrink-0 text-primary" />
              {workspace.address}
            </p>

            <div className="mt-5 flex h-48 items-center justify-center rounded-xl border border-border bg-slate-100">
              <div className="text-center">
                <FiMapPin className="mx-auto text-2xl text-text-secondary" />
                <p className="mt-2 text-sm font-medium text-text-primary">
                  {workspace.area}, {workspace.city}
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
            <div className="flex items-start justify-between gap-3 border-b border-border pb-5">
              <div>
                <p className="text-sm text-text-secondary">Starting from</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-text-primary">
                    ₹{workspace.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-text-secondary">/ hour</span>
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
                      onChange={(event) => setStartTime(event.target.value)}
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
                    onChange={(event) => setDuration(Number(event.target.value))}
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

            {bookingType === "full-day" && (
              <div className="mt-4 rounded-lg bg-background p-3">
                <p className="text-xs leading-5 text-text-secondary">
                  Full-day booking follows the workspace's operating hours.
                  The exact schedule and full-day price will be confirmed
                  through the availability system.
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
                    onClick={() => setGuests((value) => Math.max(1, value - 1))}
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
                  ₹{workspace.price.toLocaleString("en-IN")} ×{" "}
                  {bookingType === "full-day" ? "8 hours" : `${duration} hours`}
                </span>
                <span>₹{price.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-text-secondary">
                <span>Guests</span>
                <span>× {guests}</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-semibold text-text-primary">
                  Estimated total
                </span>
                <span className="text-xl font-bold text-text-primary">
                  ₹{price.toLocaleString("en-IN")}
                </span>
              </div>

              {bookingType === "full-day" && (
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  This is an indicative estimate using 8 hours. Final full-day
                  pricing must come from the workspace's configured rate.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleBooking}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
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
