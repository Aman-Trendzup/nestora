import { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid,
  FiLayers,
  FiPlusCircle,
  FiCalendar,
  FiUser,
  FiHeadphones,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { to: "/owner/dashboard", label: "Dashboard", icon: FiGrid },
    { to: "/owner/workspaces", label: "My Listings", icon: FiLayers },
    { to: "/owner/workspaces/new", label: "Add Workspace", icon: FiPlusCircle },
    { to: "/owner/reservations", label: "Reservations", icon: FiCalendar },
    { to: "/owner/profile", label: "Business Profile", icon: FiUser },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 sticky top-0 z-40 shrink-0">
        <Link
          to="/owner/dashboard"
          aria-label="NESTORA home"
          className="shrink-0 font-serif text-2xl font-bold tracking-tight text-text-primary"
        >
          Nest<span className="italic font-normal">ora</span>
          <span className="text-primary">.</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </header>

      {/* Sidebar for Desktop & Mobile Slide-over (Fixed screen height) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen border-r border-border bg-surface flex flex-col justify-between transition-transform duration-200 md:translate-x-0 shrink-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Brand - Consistent with Home Page Navbar */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Link
              to="/owner/dashboard"
              aria-label="NESTORA home"
              className="shrink-0 font-serif text-2xl font-bold tracking-tight text-text-primary"
            >
              Nest<span className="italic font-normal">ora</span>
              <span className="text-primary">.</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Business Info snippet */}
          <div className="p-3.5 mx-3 my-4 rounded-xl bg-slate-50 border border-border">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {user?.businessName?.charAt(0) || user?.fullName?.charAt(0) || "W"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary truncate">
                  {user?.businessName || user?.fullName}
                </p>
                <p className="text-[11px] text-text-secondary truncate">
                  {user?.businessCity ? `${user.businessCity} • Host` : "Workspace Host"}
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/owner/dashboard" || item.to === "/owner/workspaces"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-xs font-semibold"
                        : "text-text-secondary hover:text-text-primary hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon className="size-4.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Single Support Link (Niche Wala) & Sign out */}
        <div className="border-t border-border p-3 space-y-1 bg-surface shrink-0">
          <NavLink
            to="/owner/support"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-slate-100"
              }`
            }
          >
            <FiHeadphones className="size-4 shrink-0" />
            <span>Support</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <FiLogOut className="size-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Right portion: Only this scrolls, scrollbar hidden */}
      <div className="flex-1 md:ml-64 h-full overflow-y-auto no-scrollbar flex flex-col w-full">
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
