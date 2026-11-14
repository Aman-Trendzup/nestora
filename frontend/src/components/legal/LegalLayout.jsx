import React from "react";
import { Link, useLocation } from "react-router";
import { FiArrowUpRight, FiMail } from "react-icons/fi";

const legalLinks = [
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms of Use", path: "/terms" },
  { label: "Cancellation Policy", path: "/cancellation-policy" },
];

const LegalLayout = ({
  title,
  eyebrow = "WELCOME TO NESTORA",
  leadStatement,
  sections = [],
  lastUpdated = "November 2026",
}) => {
  const location = useLocation();

  return (
    <div className="w-full bg-background min-h-screen text-text-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        
        {/* GIANT EDITORIAL HEADER (Matching Reference UI) */}
        <div className="pb-8 sm:pb-12 border-b border-border">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-black uppercase tracking-tight text-text-primary leading-[0.95]">
            {title}
          </h1>
        </div>

        {/* MAIN BODY WITH TWO COLUMNS & BORDER DIVIDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SIDEBAR: Nav Pills & Metadata */}
          <aside className="lg:col-span-3 lg:border-r border-border py-8 lg:pr-8">
            <div className="sticky top-24 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary/70 mb-4">
                Legal Documents
              </p>

              {/* Navigation Pills */}
              <nav className="flex flex-wrap lg:flex-col gap-2.5">
                {legalLinks.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/terms" && location.pathname === "/terms-of-use");

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center justify-between gap-2.5 px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-white shadow-sm ring-2 ring-primary/20"
                          : "border border-border bg-surface text-text-secondary hover:text-text-primary hover:border-text-primary/40 hover:bg-background"
                      }`}
                    >
                      <span>{item.label}</span>
                      <FiArrowUpRight className={`size-3.5 ${isActive ? "text-white" : "text-text-secondary"}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Last Updated Badge */}
              <div className="pt-6 mt-6 border-t border-border hidden lg:block">
                <p className="text-[11px] font-medium text-text-secondary">
                  Effective Date:
                </p>
                <p className="text-xs font-semibold text-text-primary mt-0.5">
                  {lastUpdated}
                </p>
                <p className="text-[11px] text-text-secondary/70 mt-2 leading-relaxed">
                  Applies to all visitors, workspace guests, and registered hosts across Nestora.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Lead Statement & Clauses Grid */}
          <main className="lg:col-span-9 py-8 lg:pl-10 xl:pl-14">
            
            {/* Top Intro Statement Block */}
            <div className="mb-10 sm:mb-14">
              <span className="block text-xs font-bold uppercase tracking-[0.25em] text-text-secondary/60 mb-4">
                {eyebrow}
              </span>

              <p className="text-xl sm:text-2xl lg:text-[28px] font-medium leading-[1.35] text-text-primary max-w-4xl tracking-tight">
                {leadStatement}
              </p>
            </div>

            {/* Structured Content Grid with Clean Dividers */}
            <div className="border-t border-border divide-y divide-border">
              {sections.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border"
                >
                  {/* Left Cell */}
                  <article className="py-8 md:pr-8">
                    {row.left && (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[11px] font-mono font-bold text-primary tracking-wider uppercase">
                            {row.left.code}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary mb-3">
                          {row.left.title}
                        </h2>
                        <div className="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {row.left.paragraphs.map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </article>

                  {/* Right Cell */}
                  <article className="py-8 md:pl-8">
                    {row.right && (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[11px] font-mono font-bold text-primary tracking-wider uppercase">
                            {row.right.code}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary mb-3">
                          {row.right.title}
                        </h2>
                        <div className="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {row.right.paragraphs.map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </article>
                </div>
              ))}
            </div>

            {/* Bottom Support Banner */}
            <div className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Have questions regarding our policies?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                  Our compliance and legal team is happy to answer any questions or clarify terms.
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-text-primary px-5 py-2.5 text-xs font-semibold text-surface transition-opacity hover:opacity-90 shrink-0"
              >
                <FiMail className="size-4" />
                <span>Contact Legal Support</span>
              </Link>
            </div>

          </main>

        </div>

      </div>
    </div>
  );
};

export default LegalLayout;

