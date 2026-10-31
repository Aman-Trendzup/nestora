
import React from "react";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <main className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden bg-background px-5 py-20">

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute left-[10%] top-[18%] h-16 w-16 rounded-2xl border border-border bg-surface shadow-sm" />

      <div className="absolute bottom-[18%] right-[12%] h-20 w-20 rounded-full border border-border" />

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">

        {/* Label */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-text-secondary" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Error 404
          </span>
        </div>

        {/* 404 */}
        <h1 className="select-none text-[clamp(110px,24vw,240px)] font-bold leading-[0.8] tracking-[-0.09em] text-foreground">
          404<span className="text-primary">.</span>
        </h1>

        {/* Message */}
        <div className="mt-12 max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Looks like this space is unavailable.
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted sm:text-base">
            The page you're looking for may have moved, or the link might
            be incorrect. Let's help you find your next workspace.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/workspaces"
            className="group inline-flex items-center gap-5 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Explore Workspaces

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-foreground transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            to="/"
            className="rounded-full border border-border bg-surface px-7 py-4 text-sm font-medium text-foreground transition hover:border-foreground"
          >
            Back to Home
          </Link>
        </div>

        {/* Bottom note */}
        <p className="mt-12 text-xs tracking-wide text-muted">
          NEED A HAND?{" "}
          <Link
            to="/contact"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Contact our team
          </Link>
        </p>

      </section>
    </main>
  );
};

export default NotFound;
