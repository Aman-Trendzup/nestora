import React from "react";
import { Link } from "react-router";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Find a Workspace", href: "/workspaces" },
      { label: "Workspace Types", href: "/workspaces" },
      { label: "How It Works", href: "/about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "My Bookings", href: "/bookings" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black px-7 py-8 text-text-primary sm:px-10 sm:py-10 lg:px-14">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-start sm:gap-12">

        {/* Brand */}
        <div className="shrink-0">
          <Link
            to="/"
            aria-label="WORKSPACE home"
            className="shrink-0 font-serif text-xl tracking-tight text-white"
          >
            Nest<span className="italic font-normal">ora</span>
            <span className="text-primary">.</span>
          </Link>

          <p className="mt-3 max-w-[210px] text-[11px] leading-[1.7] text-white/40">
            Find a space that fits your work.
            Make room for what matters.
          </p>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-3 gap-5 sm:gap-10 lg:gap-16">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-[11px] font-semibold text-white sm:text-xs">
                {group.title}
              </h3>

              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[10px] leading-5 text-white/40 transition-colors duration-200 hover:text-primary sm:text-[11px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-white/40 pt-4 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Nestora. All rights reserved.
        </p>

        <p>Find your space. Work your way.</p>
      </div>
    </footer>
  );
}