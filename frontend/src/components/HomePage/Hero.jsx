
import { useState } from "react";
import heroImage from "../../assets/images/home/hero.avif"

export default function Hero() {
  const [location, setLocation] = useState("");
  const [workspaceType, setWorkspaceType] = useState("Any workspace");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [guests, setGuests] = useState("1");
  const [duration, setDuration] = useState("2");

  const workspaceTypes = [
    "Any workspace",
    "Coworking Space",
    "Private Office",
    "Meeting Room",
    "Conference Room",
  ];

  function handleSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams({
      location,
      type: workspaceType,
      date,
      time,
      duration,
      guests,
    });

    window.location.href = `/workspaces?${params.toString()}`;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Hero image */}
      <div
        className="relative flex min-h-96 items-start overflow-hidden rounded-lg bg-cover bg-center sm:min-h-[28rem]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/30" />

        <div className="relative z-10 max-w-2xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
          <p className="mb-3 text-sm font-medium text-surface">
            YOUR SPACE. YOUR WAY.
          </p>

          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-surface sm:text-5xl lg:text-6xl">
            Find your space to do your best work.
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-surface sm:text-lg">
            From focused workdays to important meetings, discover a space
            that works for you.
          </p>

        </div>
      </div>

      {/* Floating search panel */}
      <div
        id="workspace-search"
        className="relative z-20 mx-auto -mt-20 max-w-6xl rounded-lg border border-border bg-surface p-4 shadow-md sm:p-6"
      >
        <form onSubmit={handleSearch}>
          {/* Workspace type tabs */}
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 border-b border-border sm:gap-6">
            {workspaceTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setWorkspaceType(type)}
                className={`border-b-2 px-3 py-3 text-sm transition-colors ${workspaceType === type
                  ? "border-primary font-semibold text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search fields and button in one row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Location */}
            <label className="flex min-w-0 flex-col gap-2 border-b border-border pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <span className="text-sm font-semibold text-text-primary">
                Location
              </span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or neighbourhood"
                className="w-full min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
                required
              />
            </label>

            {/* Date */}
            <label className="flex min-w-0 flex-col gap-2 border-b border-border pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <span className="text-sm font-semibold text-text-primary">
                Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full min-w-0 bg-transparent text-sm text-text-secondary outline-none"
                required
              />
            </label>

            {/* Time */}
            <label className="flex min-w-0 flex-col gap-2 border-b border-border pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <span className="text-sm font-semibold text-text-primary">
                Start Time
              </span>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full min-w-0 bg-transparent text-sm text-text-secondary outline-none"
                required
              />
            </label>

            {/* Duration */}
            <label className="flex min-w-0 flex-col gap-2 border-b border-border pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <span className="text-sm font-semibold text-text-primary">
                Duration
              </span>

              <select
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full bg-transparent text-sm text-text-primary outline-none"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="full-day">Full day</option>
              </select>
            </label>

            {/* Guests */}
            <label className="flex min-w-0 flex-col gap-2 border-b border-border pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <span className="text-sm font-semibold text-text-primary">
                Guests
              </span>
              <select
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                className="w-full bg-transparent text-sm text-text-primary outline-none"
              >
                <option value="1">1 person</option>
                <option value="2">2 people</option>
                <option value="3">3 people</option>
                <option value="4">4 people</option>
                <option value="5">5 people</option>
                <option value="6">6 people</option>
                <option value="7">7 people</option>
                <option value="8">8+ people</option>
              </select>
            </label>

            {/* Search button at the end of the row */}
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 self-center bg-primary px-4 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4 shrink-0"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>
              Find a Workspace
            </button>
          </div>
        </form>
      </div>
    </section >
  );
}
