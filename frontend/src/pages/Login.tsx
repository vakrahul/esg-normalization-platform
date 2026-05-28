import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("analyst123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await authApi.login(username, password);
      // Optimistically navigate — refetch in background
      navigate("/upload", { replace: true });
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg === "Failed to fetch") {
        setError(
          "Cannot reach the API. Check that the backend is running and VITE_API_URL is set correctly."
        );
      } else {
        setError(msg);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-sm">
      {/* Card */}
      <div className="rounded-2xl border border-white/80 bg-white/95 p-8 shadow-xl backdrop-blur-md">
        {/* Logo mark */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-950">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-brand-950">Analyst sign in</h1>
          <p className="text-sm text-slate-500">Access the ESG review workspace</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Username
            </label>
            <input
              autoFocus
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="analyst"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Default credentials: <span className="font-mono text-slate-600">analyst / analyst123</span>
        </p>
      </div>
    </div>
  );
}
