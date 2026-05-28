import { ClipboardList, CloudUpload, LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
  user?: { username: string } | null;
}

export default function AppShell({ user }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    await authApi.logout();
    // Immediately wipe cached user — makes header switch Sign out→Sign in
    // in the same render tick without waiting for a refetch
    qc.setQueryData(["me"], null);
    qc.removeQueries({ queryKey: ["me"] });
    setMenuOpen(false);
    navigate("/");
  };

  if (isLanding) {
    return (
      <div className="min-h-screen">
        <header className="absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8 md:py-6">
            <Link
              to="/"
              className="rounded-2xl border border-white/60 bg-white/80 px-5 py-2.5 text-base font-semibold tracking-tight text-slate-900 shadow-sm backdrop-blur-md transition hover:bg-white/95"
            >
              Breathe ESG
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-white/75 px-3 py-1.5 text-sm text-slate-700 backdrop-blur-md">
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white/95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-brand-800"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition ${
      isActive
        ? "bg-brand-950 text-white"
        : "text-slate-500 hover:bg-slate-100 hover:text-brand-800"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/90 via-teal-50/40 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        {/* Left: brand + nav */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-md">
          <Link
            to="/"
            className="text-base font-semibold tracking-tight text-brand-950 transition hover:text-brand-700 mr-3"
          >
            Breathe ESG
          </Link>
          {user && (
            <>
              {/* Desktop nav */}
              <nav className="hidden items-center gap-1 md:flex">
                <NavLink to="/upload" className={navLinkClass}>
                  <CloudUpload className="h-3.5 w-3.5" />
                  Upload
                </NavLink>
                <NavLink to="/review" className={navLinkClass}>
                  <ClipboardList className="h-3.5 w-3.5" />
                  Review
                </NavLink>
              </nav>

              {/* Mobile nav */}
              <div className="relative md:hidden">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  Menu
                </button>
                {menuOpen && (
                  <div className="absolute left-0 mt-2 w-44 overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 shadow-lg backdrop-blur-md">
                    <Link
                      to="/upload"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-slate-800 hover:bg-emerald-50/60"
                      onClick={() => setMenuOpen(false)}
                    >
                      <CloudUpload className="h-4 w-4 text-slate-400" />
                      Upload
                    </Link>
                    <Link
                      to="/review"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-slate-800 hover:bg-emerald-50/60"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ClipboardList className="h-4 w-4 text-slate-400" />
                      Review
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: user + logout */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              {user.username}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-950 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-800"
          >
            Sign in
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
