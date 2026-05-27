import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import PillButton from "./PillButton";
import { authApi } from "../api/client";

interface Props {
  user?: { username: string } | null;
}

export default function AppShell({ user }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const logout = async () => {
    await authApi.logout();
    navigate("/login");
  };

  if (isLanding) {
    return (
      <div className="min-h-screen">
        <header className="absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8 md:py-6">
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
                <PillButton
                  variant="secondary"
                  className="!border-white/60 !bg-white/80 !shadow-sm backdrop-blur-md"
                  onClick={logout}
                >
                  Sign out
                </PillButton>
              </div>
            ) : (
              <Link to="/login">
                <PillButton className="!bg-emerald-900 !px-6 !shadow-md hover:!bg-emerald-800">
                  Sign in
                </PillButton>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/90 via-teal-50/40 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-8 rounded-full border border-white/70 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-md">
          <Link to="/" className="text-lg font-semibold tracking-tight text-brand-950">
            Breathe ESG
          </Link>
          {user && (
            <nav className="hidden gap-6 text-xs font-medium uppercase tracking-widest text-slate-600 md:flex">
              <Link to="/upload" className="hover:text-brand-800">
                Upload
              </Link>
              <Link to="/review" className="hover:text-brand-800">
                Review
              </Link>
            </nav>
          )}
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.username}</span>
            <PillButton variant="secondary" onClick={logout}>
              Sign out
            </PillButton>
          </div>
        ) : (
          <Link to="/login">
            <PillButton variant="primary">Sign in</PillButton>
          </Link>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
