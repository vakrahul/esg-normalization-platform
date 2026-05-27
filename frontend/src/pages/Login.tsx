import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, ensureCsrf } from "../api/client";
import PillButton from "../components/PillButton";

export default function Login() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("analyst123");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await ensureCsrf();
      await authApi.login(username, password);
      await qc.invalidateQueries({ queryKey: ["me"] });
      navigate("/upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/80 bg-white/90 p-8 shadow-sm">
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
        <PillButton type="submit" className="w-full">
          Sign in
        </PillButton>
      </form>
      <p className="mt-4 text-xs text-slate-500">Default: analyst / analyst123 (after seed_data)</p>
    </div>
  );
}
