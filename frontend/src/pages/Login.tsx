import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/client";
import PillButton from "../components/PillButton";

export default function Login() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("analyst123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await authApi.login(username, password);
      await qc.invalidateQueries({ queryKey: ["me"] });
      setShowSuccess(true);
      window.setTimeout(() => navigate("/upload"), 650);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg === "Failed to fetch") {
        setError(
          "Cannot reach the API. On Render: set VITE_API_URL to your backend URL + /api, then redeploy the static site. Also confirm the API health URL loads in your browser."
        );
      } else {
        setError(msg);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-md rounded-2xl border border-white/80 bg-white/90 p-8 shadow-sm">
      {showSuccess && (
        <div className="login-success-pop absolute inset-x-6 -top-12 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm font-medium text-emerald-900 shadow-md">
          Signed in successfully. Opening workspace...
        </div>
      )}
      <h2 className="font-serif text-2xl text-brand-950">Analyst sign in</h2>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-600">Username</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <PillButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </PillButton>
      </form>
      <p className="mt-4 text-xs text-slate-500">Default: analyst / analyst123 (after seed_data)</p>
    </div>
  );
}
