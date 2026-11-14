import React from "react";
import about1 from "../../assets/images/about/hero/about1.webp";
import about2 from "../../assets/images/about/hero/about2.webp";

const AboutHero = () => {
  return (
    <section className="bg-surface py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Row matching other sections */}
        <div className="mb-10 sm:mb-14 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              We are Nestora
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
              We set out to build a better way to work.
            </h1>
          </div>

          <div className="lg:col-span-5 lg:pb-1">
            <p className="text-sm sm:text-base leading-relaxed text-text-secondary">
              Together—the verified workspace partners, remote innovators, and growing teams of NESTORA—we are reinventing how professionals discover and experience flexible workspaces end-to-end.
            </p>
          </div>
        </div>

        {/* Visual Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6">
          <div className="sm:col-span-7 h-[280px] sm:h-[380px] lg:h-[420px] overflow-hidden rounded-lg sm:rounded-xl border border-border bg-background shadow-xs group">
            <img
              src={about1}
              alt="Community celebrating teamwork at Nestora"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="sm:col-span-5 h-[280px] sm:h-[380px] lg:h-[420px] overflow-hidden rounded-lg sm:rounded-xl border border-border bg-background shadow-xs group">
            <img
              src={about2}
              alt="Modern collaborative coworking space"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
