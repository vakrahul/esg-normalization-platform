import { Link, Outlet, useNavigate } from "react-router-dom";
import PillButton from "./PillButton";
import { authApi } from "../api/client";

interface Props {
  user?: { username: string } | null;
}

export default function AppShell({ user }: Props) {
  const navigate = useNavigate();

  const logout = async () => {
    await authApi.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/90 via-teal-50/40 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-8 rounded-full border border-white/60 bg-white/80 px-6 py-3 shadow-sm backdrop-blur">
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
