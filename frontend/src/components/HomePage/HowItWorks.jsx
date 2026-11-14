import { useState } from "react";
import { Link } from "react-router";

const steps = [
  {
    step: 1,
    title: "Discover & Filter Spaces",
    description:
      "Search coworking desks, private team offices, and meeting suites across prime commercial hubs by location, date, time, and budget.",
  },
  {
    step: 2,
    title: "Pick Schedule & Budget",
    description:
      "Select exact hourly booking windows or full-day passes on demand. Enjoy transparent rates with zero security deposits or long-term lease lock-ins.",
  },
  {
    step: 3,
    title: "Instant Lock & Confirmation",
    description:
      "Real-time calendar verification with atomic slot locking prevents double bookings and instantly generates your verified digital reference code.",
  },
  {
    step: 4,
    title: "Check In & Pay Offline at Venue",
    description:
      "Arrive at the workspace, present your reference code at reception, and settle payment conveniently offline via UPI, card, or cash upon check-in.",
  },
];

export default function HowItWorks() {
  // Steps 1 & 2 active by default, exactly mirroring the reference image
  const [activeSteps, setActiveSteps] = useState([1, 2]);

  const toggleStep = (stepNumber) => {
    setActiveSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16 items-start">

          {/* =========================================================
              LEFT COLUMN: Editorial Narrative & "Ready to start?" Card
             ========================================================= */}
          <div className="space-y-8">

            {/* Main Editorial Headline */}
            <div className="space-y-3">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-normal leading-[1.08] tracking-tight text-slate-900">
                Simple Steps to <br />
                <span className="italic">Reserve Your Space</span>
              </h2>

              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                It all starts with a single search.
              </p>
            </div>

            {/* Narrative Paragraph */}
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7 max-w-lg">
              Nestora eliminates rigid multi-month leases, hefty lock-in deposits,
              and opaque venue pricing. Whether you're an independent professional
              seeking quiet focus or a distributed team booking a client meeting
              suite, our platform connects you with admin-vetted workspaces in
              minutes.
            </p>

          </div>

          {/* =========================================================
              RIGHT COLUMN: Stepper Timeline with Speech-Bubble Notches
             ========================================================= */}
          <div className="relative pt-2">
            {/* Vertical Connecting Timeline Line */}
            <div
              aria-hidden="true"
              className="absolute left-[19px] sm:left-[23px] top-6 bottom-10 w-[2px] bg-slate-200"
            />

            <div className="space-y-6 sm:space-y-8">
              {steps.map((item) => {
                const isHighlight = activeSteps.includes(item.step);

                return (
                  <div
                    key={item.step}
                    className="relative flex items-start gap-4 sm:gap-6 group"
                  >
                    {/* Circle Step Number */}
                    <button
                      type="button"
                      onClick={() => toggleStep(item.step)}
                      aria-label={`Toggle step ${item.step}`}
                      className={`relative z-10 flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${isHighlight
                        ? "bg-primary text-white shadow-xs scale-105"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {item.step}
                    </button>

                    {/* Step Content Container */}
                    <div className="flex-1 min-w-0">
                      {isHighlight ? (
                        /* Highlighted Green Card with Left Triangle Notch (from reference) */
                        <div className="relative rounded-2xl bg-primary p-5 sm:p-6 text-white shadow-xs transition-all duration-300">
                          {/* Triangle pointer notch pointing back at the circle */}
                          <div
                            aria-hidden="true"
                            className="absolute -left-2 top-4 sm:top-5 size-0 border-y-[8px] border-y-transparent border-r-[8px] border-r-primary"
                          />

                          <h4 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-white">
                            {item.title}
                          </h4>

                          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-white/90">
                            {item.description}
                          </p>
                        </div>
                      ) : (
                        /* Standard Upcoming Step (from reference) */
                        <div
                          onClick={() => toggleStep(item.step)}
                          className="pt-1.5 sm:pt-2 cursor-pointer rounded-xl p-2 -ml-2 transition-colors hover:bg-slate-50"
                        >
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                            {item.title}
                          </h4>

                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
