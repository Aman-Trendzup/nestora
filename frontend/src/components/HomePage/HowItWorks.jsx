const steps = [
  {
    number: "01",
    title: "Find your space",
    description:
      "Explore workspaces for every kind of workday, from focused solo sessions to team meetups.",
  },
  {
    number: "02",
    title: "Choose your schedule",
    description:
      "Select the date and time that suit your plans. Your workspace, on your schedule.",
  },
  {
    number: "03",
    title: "Check & reserve",
    description:
      "Check availability and review the details before reserving the space that feels right.",
  },
  {
    number: "04",
    title: "You're all set",
    description:
      "Receive your booking confirmation and keep your reservation details close at hand.",
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-12 text-center sm:mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
            A simpler way to work
          </p>

          <h2 className="text-3xl font-medium tracking-tight text-text-primary sm:text-4xl lg:text-[42px]">
            How It Works
          </h2>
        </div>

        {/* Timeline and feature panel */}
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
          {/* Booking steps */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute bottom-10 left-[35px] top-10 border-l border-dashed border-primary/25 sm:left-[43px]"
            />

            <div className="space-y-8 sm:space-y-9">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative grid grid-cols-[58px_minmax(0,1fr)] gap-4 sm:grid-cols-[74px_minmax(0,1fr)] sm:gap-4"
                >
                  {/* Step number */}
                  <div className="relative z-10 flex items-start justify-center">
                    <span className="text-[38px] font-semibold leading-none tracking-[-0.07em] text-text-secondary/[0.78] sm:text-[48px]">
                      {step.number}
                    </span>
                  </div>

                  {/* Step content */}
                  <div className="pt-0.5">
                    <h3 className="text-xl font-medium tracking-tight text-text-primary sm:text-[23px]">
                      {step.title}
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary sm:text-[14px] sm:leading-[1.8]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature panel */}

          <div className="relative min-h-[300px] overflow-hidden rounded-[32px] bg-primary sm:min-h-[360px] lg:min-h-[470px] lg:rounded-l-[80px] lg:rounded-r-none">

            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=90"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Dark overlay for text readability */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/65"
            />

            {/* Extra gradient behind the content */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20"
            />

            {/* Subtle decorative geometry */}
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-72 w-72 rotate-12 rounded-[56px] border border-white/20 sm:h-96 sm:w-96"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-16 h-72 w-72 rotate-[-24deg] rounded-[64px] bg-white/[0.06] sm:h-96 sm:w-96"
            />

            {/* Panel content */}
            <div className="relative z-10 flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center text-white sm:min-h-[360px] sm:px-10 lg:min-h-[470px]">

              <span className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Your next workday starts here
              </span>

              <h3 className="max-w-md text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                The right space.
                <span className="mt-1 block font-normal italic">
                  Just a few steps away.
                </span>
              </h3>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/85">
                Less time figuring things out. More time doing your best work.
                Find a space that fits your day.
              </p>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}