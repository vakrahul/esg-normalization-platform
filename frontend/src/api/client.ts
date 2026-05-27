const API_BASE = import.meta.env.VITE_API_URL || "/api";

/** CSRF from /auth/csrf/ body (works across Render subdomains; cookie alone does not). */
let csrfToken: string | null = null;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const csrf = csrfToken || getCookie("csrftoken");
  if (csrf && options.method && options.method !== "GET") {
    headers.set("X-CSRFToken", csrf);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || JSON.stringify(err));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function ensureCsrf() {
  const data = await apiFetch<{ csrfToken: string }>("/auth/csrf/");
  csrfToken = data.csrfToken;
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ username: string; id: number }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiFetch("/auth/logout/", { method: "POST" }),
  me: () => apiFetch<{ username: string; id: number }>("/auth/me/"),
};

export interface ImportBatch {
  id: number;
  source_type: string;
  original_filename: string;
  status: string;
  row_count: number;
  success_count: number;
  flagged_count: number;
  failed_count: number;
  imported_at: string;
}

export interface Activity {
  id: number;
  source_type: string;
  activity_type: string;
  scope: string;
  activity_date: string | null;
  quantity: number | null;
  unit: string;
  spend_amount: number | null;
  currency: string;
  amount_display: string;
  estimated_emissions_kgco2e: number | null;
  source_reference_id: string | null;
  review_status: string;
  locked_for_audit: boolean;
  issue_count: number;
  highest_severity: string | null;
  created_at: string;
  normalized_unit?: string;
  facility?: string;
  vendor?: string;
  metadata?: Record<string, unknown>;
  review_comment?: string | null;
  approved_at?: string | null;
  locked_at?: string | null;
  raw_record?: {
    id: number;
    row_number: number;
    raw_payload: Record<string, unknown>;
    processing_status: string;
    processing_error: string | null;
    created_at?: string;
  };
  validation_issues?: Array<{
    id: number;
    severity: string;
    issue_type: string;
    message: string;
    resolved: boolean;
  }>;
  audit_logs?: Array<{
    id: number;
    action: string;
    old_value: unknown;
    new_value: unknown;
    changed_by_username: string | null;
    changed_at: string;
  }>;
}

export interface ActivitySummary {
  total: number;
  imported: number;
  flagged: number;
  approved: number;
  rejected: number;
  locked: number;
  pending: number;
  with_issues: number;
}

export interface ImportBatchDetail extends ImportBatch {
  issue_count: number;
  failure_summary: Array<{ row_number: number; error: string }>;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const importsApi = {
  sap: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<ImportBatch>("/imports/sap/", { method: "POST", body: fd });
  },
  utility: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<ImportBatch>("/imports/utility/", { method: "POST", body: fd });
  },
  travelSync: (dataset: "default" | "domestic" | "international" = "default") =>
    apiFetch<ImportBatch>(`/imports/travel-sync/?dataset=${dataset}`, {
      method: "POST",
      body: "{}",
    }),
  travelJson: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<ImportBatch>("/imports/travel/", { method: "POST", body: fd });
  },
  batches: () => apiFetch<Paginated<ImportBatch> | ImportBatch[]>("/import-batches/"),
  batchDetail: (id: number) => apiFetch<ImportBatchDetail>(`/import-batches/${id}/`),
  resetDemo: () =>
    apiFetch<{ detail: string; deleted_rows: number }>("/demo/reset/", {
      method: "POST",
      body: "{}",
    }),
};

export const activitiesApi = {
  summary: () => apiFetch<ActivitySummary>("/activities/summary/"),
  list: (params: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch<Paginated<Activity>>(`/activities/?${q}`);
  },
  get: (id: number) => apiFetch<Activity>(`/activities/${id}/`),
  approve: (id: number, review_comment?: string) =>
    apiFetch<Activity>(`/activities/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({ review_comment: review_comment || "" }),
    }),
  reject: (id: number, review_comment?: string) =>
    apiFetch<Activity>(`/activities/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ review_comment: review_comment || "" }),
    }),
  lock: (id: number) =>
    apiFetch<Activity>(`/activities/${id}/lock/`, { method: "POST", body: "{}" }),
};
