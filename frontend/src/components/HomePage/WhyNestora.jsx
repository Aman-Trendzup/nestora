
export default function WhyNestora() {
  return (
    <section className=" px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-2xl bg-slate-900">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=90"
            alt="Sunlit contemporary coworking space with shared work tables"
            loading="lazy"
            className="absolute inset-0 -z-20 size-full object-cover object-center"
          />

          {/* Dark overlay for readable text */}
          <div className="absolute inset-0 -z-10 bg-slate-950/60" />

          {/* Banner content */}
          <div className="grid min-h-[360px] items-end gap-8 p-6 sm:min-h-[400px] sm:p-10 lg:min-h-[440px] lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 lg:p-14">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                Why book with NESTORA?
                <span className="h-px w-9 bg-white/60" />
              </p>

              <h2 className="text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                More than just spaces.
                <span className="mt-1 block font-normal italic">
                  A better way to work.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                Find a workspace that fits your workday. Explore your options,
                understand the pricing, and reserve a space that works for you
                — all in one place.
              </p>
            </div>

            {/* CTA */}
            <div className="lg:pb-1">
              <a
                href="/spaces"
                className="group inline-flex min-h-12 w-full items-center justify-between gap-8 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 sm:w-auto"
              >
                Explore workspaces

                <span
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-200 group-hover:translate-x-1"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-4"
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
