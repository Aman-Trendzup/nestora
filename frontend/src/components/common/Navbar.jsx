
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Explore Spaces", href: "/workspaces" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="relative z-50 w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          aria-label="NESTORA home"
          className="shrink-0 font-serif text-xl tracking-tight text-text-primary"
        >
          Nest<span className="italic font-normal">ora</span>
          <span className="text-primary">.</span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="whitespace-nowrap text-xs text-text-primary transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-5 lg:flex">

          {isAuthenticated ? (
            <>
              <span className="max-w-36 truncate text-xs text-text-secondary">
                Welcome, {user?.fullName?.split(" ")[0]}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap text-xs text-text-primary transition-colors hover:text-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="whitespace-nowrap text-xs text-text-primary transition-colors hover:text-primary"
            >
              Login
            </Link>
          )}

          <Link
            to="/register/owner"
            className="relative inline-flex h-9 items-center justify-center border border-text-primary bg-text-primary px-4 text-xs text-surface transition-colors hover:border-primary hover:bg-primary"
          >
            List Your Space
            <span className="absolute inset-x-4 bottom-0 h-0.5 bg-primary" />
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-3 lg:hidden">

          <Link
            to="/register/owner"
            className="relative inline-flex h-9 items-center justify-center border border-text-primary bg-text-primary px-3 text-xs text-surface"
          >
            List Your Space
            <span className="absolute inset-x-3 bottom-0 h-0.5 bg-primary" />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="workspace-mobile-menu"
            className="flex size-9 items-center justify-center border border-border text-text-primary transition-colors hover:text-primary"
          >
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          id="workspace-mobile-menu"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-t border-border bg-surface px-4 py-3 shadow-md sm:px-6 lg:hidden"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-border py-3 text-sm text-text-primary transition-colors last:border-0 hover:text-primary"
            >
              {link.label}
            </a>
          ))}

          <div className="mt-3 border-t border-border pt-3">

            {isAuthenticated ? (
              <>
                <p className="mb-3 text-sm text-text-secondary">
                  Welcome, {user?.fullName}
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-primary"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
