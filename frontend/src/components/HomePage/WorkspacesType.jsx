const workspaceTypes = [
  {
    title: "Coworking Spaces",
    description:
      "Find your flow in spaces built for focus, flexibility, and connection.",
    link: "/workspaces?type=coworking",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Bright, contemporary coworking space",
    layout: "lg:col-span-7",
  },
  {
    title: "Dedicated Desks",
    description: "Your own desk. Your routine. A better way to work.",
    link: "/workspaces?type=dedicated-desk",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Dedicated workstation in a modern office",
    layout: "lg:col-span-5",
  },
  {
    title: "Private Offices",
    description:
      "Room for your team to think, build, and grow together.",
    link: "/workspaces?type=private-office",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Modern private office interior",
    layout: "lg:col-span-5",
  },
  {
    title: "Meeting Rooms",
    description:
      "Bring people together for conversations that move work forward.",
    link: "/workspaces?type=meeting-room",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Professional meeting and collaboration space",
    layout: "lg:col-span-7",
  },
];

export default function WorkspaceTypes() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Section heading */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-text-secondary">
          Find your fit
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Explore by Workspace Type
        </h2>
      </div>

      {/* Asymmetric workspace category grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {workspaceTypes.map((workspace) => (
          <article
            key={workspace.title}
            className={`group relative isolate flex min-h-64 overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md sm:min-h-72 ${workspace.layout}`}
          >
            {/* Text content */}
            <div className="relative z-10 flex w-3/5 flex-col items-start justify-center py-8 pl-5 pr-2 sm:py-10 sm:pl-8 sm:pr-0 lg:pl-10">
              <h3 className="max-w-56 text-xl font-medium tracking-tight text-text-primary sm:text-2xl">
                {workspace.title}
              </h3>

              <p className="mt-3 max-w-56 text-sm leading-relaxed text-text-secondary">
                {workspace.description}
              </p>

              <a
                href={workspace.link}
                className="mt-6 inline-flex items-center gap-2 border-b border-border pb-1 text-sm font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary"
              >
                Explore category
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>

            {/* Image on the right */}
            <div className="absolute inset-y-0 right-0 w-2/5 overflow-hidden sm:w-1/2">
              <img
                src={workspace.image}
                alt={workspace.imageAlt}
                loading="lazy"
                className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}