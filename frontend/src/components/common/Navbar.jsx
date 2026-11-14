import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  FiGrid,
  FiCalendar,
  FiUser,
  FiLogOut,
  FiPlus,
  FiMenu,
  FiX,
  FiLayers,
} from "react-icons/fi";

const links = [
  { label: "Explore Spaces", href: "/workspaces" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const isCustomer = isAuthenticated && user?.role === "customer";
  const isBookingsActive = location.pathname.startsWith("/customer/bookings");
  const isProfileActive = location.pathname.startsWith("/customer/profile");

  return (
    <header className="relative z-50 w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          aria-label="NESTORA home"
          className="shrink-0 font-serif text-2xl font-bold tracking-tight text-text-primary"
        >
          Nest<span className="italic font-normal">ora</span>
          <span className="text-primary">.</span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA / Auth section */}
        <div className="hidden items-center gap-4 lg:flex">
          {isCustomer ? (
            <div className="flex items-center gap-3">
              <Link
                to="/customer/bookings"
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                  isBookingsActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-primary hover:bg-slate-100"
                }`}
              >
                <FiCalendar className="size-3.5" />
                <span>My Bookings</span>
              </Link>

              <Link
                to="/customer/profile"
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                  isProfileActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-primary hover:bg-slate-100"
                }`}
              >
                <FiUser className="size-3.5" />
                <span>Profile</span>
              </Link>

              <div className="h-4 w-px bg-border mx-1" />

              <span className="text-xs font-semibold text-text-primary max-w-28 truncate capitalize">
                {user?.fullName?.split(" ")[0]}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition px-2 py-1.5 rounded-lg hover:bg-rose-50"
                title="Sign out"
              >
                <FiLogOut className="size-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-text-primary transition-colors hover:text-primary"
              >
                Sign In
              </Link>

              <Link
                to="/register/owner"
                className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-hover"
              >
                List Your Space
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {!isCustomer && (
            <Link
              to="/register/owner"
              className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg"
            >
              List Space
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-text-primary hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-4 lg:hidden space-y-3">
          {isCustomer && (
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-sm font-bold text-text-primary capitalize">
                  {user?.fullName}
                </p>
                <p className="text-xs text-text-secondary capitalize">
                  Customer Account
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition"
              >
                <FiLogOut className="size-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}

          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-text-secondary hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {isCustomer ? (
            <div className="border-t border-border pt-3 space-y-2">
              <Link
                to="/customer/bookings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-primary py-1.5"
              >
                <FiCalendar className="size-4" />
                <span>My Bookings</span>
              </Link>

              <Link
                to="/customer/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-text-primary py-1.5"
              >
                <FiUser className="size-4" />
                <span>Account Profile</span>
              </Link>
            </div>
          ) : (
            <div className="border-t border-border pt-3 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-text-primary border border-border rounded-lg"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-primary rounded-lg"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
