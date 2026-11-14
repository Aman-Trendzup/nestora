import React from "react";
import { FiArrowDownRight } from "react-icons/fi";

const AboutStory = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-300/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Heading with diagonal downward arrow */}
          <div className="lg:col-span-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Origin & Vision
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-text-primary flex items-end gap-2">
              <span>Our Story</span>
              <span className="text-xl sm:text-3xl lg:text-4xl font-light text-primary select-none">
                <FiArrowDownRight />
              </span>
            </h2>
          </div>

          {/* Right Column: Narrative + Founder Quote Card */}
          <div className="lg:col-span-8 space-y-6">
            <p className="text-base sm:text-lg font-medium text-text-primary leading-relaxed">
              Our founders started <span className="font-semibold text-primary">NESTORA</span> because we wanted to make it easy for anyone to access world-class productive environments: flexible, affordable, and free from the rigid shackles of traditional commercial leases.
            </p>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              We realized that the modern way of working had evolved, but the spaces supporting it hadn’t caught up. Remote engineers were trapped in noisy coffee shops, distributed startup teams lacked dedicated meeting rooms for high-stakes pitches, and premium coworking operators had open desks sitting idle. NESTORA was built to bridge this disconnect with an intuitive discovery and booking platform tailored to every schedule, location, and budget.
            </p>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              By empowering customers to discover verified spaces, workspace owners to manage listings and reservations seamlessly, and super admins to maintain absolute quality control, NESTORA champions complete transparency. With instant booking confirmation and convenient pay-at-venue flexibility, we let you focus on what matters most: doing your best work.
            </p>

            {/* Founder Quote Card matching site's card style */}
            <div className="mt-8 rounded-lg sm:rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Aarav Sharma - Founder & CEO"
                  className="size-12 rounded-full object-cover ring-2 ring-border shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Aarav Sharma</h4>
                  <p className="text-xs text-text-secondary">Founder & CEO, NESTORA</p>
                </div>
              </div>

              <blockquote className="text-sm italic text-text-secondary leading-relaxed border-l-2 border-primary pl-3.5">
                &ldquo;Our goal is to build a modern workspace ecosystem for the individual professional and forward-thinking company alike—one that is simpler, more reliable, transparent, and built on community trust.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStory;
