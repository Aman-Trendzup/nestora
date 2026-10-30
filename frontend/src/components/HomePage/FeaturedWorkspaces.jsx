const workspaces = [
  {
    id: 1,
    name: "The Work Loft",
    location: "Connaught Place, Delhi",
    price: "₹350",
    priceUnit: "/ hour",
    type: "Coworking",
    amenities: ["Wi-Fi", "Power backup"],
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Bright coworking space with shared desks",
    href: "/spaces/the-work-loft",
  },
  {
    id: 2,
    name: "The Private Suite",
    location: "Sector 62, Noida",
    price: "₹1,200",
    priceUnit: "/ day",
    type: "Private Office",
    amenities: ["Wi-Fi", "AC"],
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Contemporary private office with workstations",
    href: "/spaces/the-private-suite",
  },
  {
    id: 3,
    name: "The Meeting Studio",
    location: "Cyber City, Gurugram",
    price: "₹800",
    priceUnit: "/ hour",
    type: "Meeting Room",
    amenities: ["Display", "Wi-Fi"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Modern professional workspace and meeting area",
    href: "/spaces/the-meeting-studio",
  },
];

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="size-3.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function FeaturedWorkspaces() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section heading */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Handpicked workspaces
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Spaces worth working from.
          </h2>
        </div>

        <a
          href="/spaces"
          className="mb-1 hidden shrink-0 items-center gap-2 text-sm font-medium text-text-primary transition-colors hover:text-primary sm:inline-flex"
        >
          View all spaces
          <ArrowIcon />
        </a>
      </div>

      {/* Workspace cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <article
            key={workspace.id}
            className="group overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Image and overlays */}
            <div className="relative overflow-hidden">
              <a
                href={workspace.href}
                aria-label={`View ${workspace.name}`}
                className="block aspect-[4/3] overflow-hidden"
              >
                <img
                  src={workspace.image}
                  alt={workspace.imageAlt}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </a>

              <span className="absolute left-3 top-3 rounded-md bg-text-primary px-3 py-1 text-xs font-medium text-surface">
                {workspace.type}
              </span>

              <button
                type="button"
                aria-label={`Save ${workspace.name} to favourites`}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-surface text-text-primary transition-colors hover:text-primary"
              >
                <HeartIcon />
              </button>
            </div>

            {/* Workspace details */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-text-primary">
                    {workspace.name}
                  </h3>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                    <LocationIcon />
                    <span>{workspace.location}</span>
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4">
                {workspace.amenities.map((amenity) => (
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
              </div>

              {/* Price and CTA */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-text-primary">
                  {workspace.price}
                  <span className="ml-1 text-xs font-normal text-text-secondary">
                    {workspace.priceUnit}
                  </span>
                </p>

                <a
                  href={workspace.href}
                  aria-label={`View workspace details for ${workspace.name}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-primary"
                >
                  View Workspace
                  <ArrowIcon />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Mobile view-all link */}
      <a
        href="/spaces"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-text-primary transition-colors hover:text-primary sm:hidden"
      >
        View all spaces
        <ArrowIcon />
      </a>
    </section>
  );
}