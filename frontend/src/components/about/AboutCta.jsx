import React from "react";
import { Link } from "react-router";

const AboutCta = () => {
  return (
    <section className="bg-surface py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-primary px-6 py-10 sm:px-10 sm:py-14 text-white shadow-md">
          {/* Subtle background element */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left Column: Heading & Subtitle */}
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/80">
                Ready to get started?
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-tight">
                Find your perfect workspace today.
              </h2>
              <p className="mt-2 text-sm text-white/90 leading-relaxed">
                NESTORA is about connecting you with inspiring desks, private suites, and meeting rooms tailored to your budget and schedule.
              </p>
            </div>

            {/* Right Column: White Action Button */}
            <div className="shrink-0">
              <Link
                to="/workspaces"
                className="group inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary shadow-xs transition hover:bg-slate-50 hover:text-primary-hover"
              >
                <span>Explore workspaces</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCta;
