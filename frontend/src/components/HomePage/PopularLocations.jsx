
const locations = [
  {
    name: "Gurugram",
    subtitle: "Business, without the commute.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85",
    alt: "Modern commercial buildings",
    href: "/workspaces?location=Gurugram",
  },
  {
    name: "Delhi",
    subtitle: "Find your place in the capital.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
    alt: "City skyline at dusk",
    href: "/workspaces?location=Delhi",
  },
  {
    name: "Noida",
    subtitle: "Make room for your next idea.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    alt: "Contemporary workspace",
    href: "/workspaces?location=Noida",
  },
  {
    name: "Bengaluru",
    subtitle: "A better space to build what's next.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85",
    alt: "Bright modern office",
    href: "/workspaces?location=Bengaluru",
  },
  {
    name: "Mumbai",
    subtitle: "Find focus in the city that moves.",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85",
    alt: "City buildings and skyline",
    href: "/workspaces?location=Mumbai",
  },
  {
    name: "Hyderabad",
    subtitle: "Space to think bigger.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85",
    alt: "Modern professional workspace",
    href: "/workspaces?location=Hyderabad",
  },
];
export default function PopularLocations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Find your next workspace
          </p>

          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Good work starts in the right place.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
            From India's leading business hubs to your neighbourhood,
            find a workspace that fits your day.
          </p>
        </div>

        <a
          href="/workspaces"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-primary"
        >
          Explore all spaces
          <span aria-hidden="true">→</span>
        </a>
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <a
            key={location.name}
            href={location.href}
            className="group relative isolate flex min-h-56 overflow-hidden rounded-lg bg-surface sm:min-h-64"
          >
            <img
              src={location.image}
              alt={location.alt}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-slate-950/40 transition-colors group-hover:bg-slate-950/50" />

            <div className="relative z-10 mt-auto flex w-full items-end justify-between gap-3 p-5 sm:p-6">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-surface">
                  {location.name}
                </h3>

                <p className="mt-1 text-sm text-surface">
                  {location.subtitle}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-surface text-surface transition-colors group-hover:bg-surface group-hover:text-text-primary"
              >
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
