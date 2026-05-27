import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell";
import { authApi, getAuthToken } from "./api/client";
import ActivityDetail from "./pages/ActivityDetail";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ReviewDashboard from "./pages/ReviewDashboard";
import Upload from "./pages/Upload";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      if (!getAuthToken()) throw new Error("Not authenticated");
      return authApi.me();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-500">Loading…</div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      if (!getAuthToken()) return null;
      try {
        return await authApi.me();
      } catch {
        return null;
      }
    },
    retry: false,
  });

  return (
    <Routes>
      <Route element={<AppShell user={user ?? null} />}>
        <Route index element={<Landing />} />
        <Route path="login" element={user ? <Navigate to="/upload" replace /> : <Login />} />
        <Route
          path="upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="review"
          element={
            <ProtectedRoute>
              <ReviewDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="activities/:id"
          element={
            <ProtectedRoute>
              <ActivityDetail />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
