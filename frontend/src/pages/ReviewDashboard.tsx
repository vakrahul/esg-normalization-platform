import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronRight,
  ClipboardList,
  Filter,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { activitiesApi, Activity } from "../api/client";
import SummaryBanner from "../components/SummaryBanner";
import { severityBadge, severityRank } from "../lib/severity";

const helper = createColumnHelper<Activity>();

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-slate-100 text-slate-700" },
  flagged: { label: "Flagged", classes: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", classes: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", classes: "bg-red-100 text-red-800" },
};

const statusPills = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function formatScope(raw: string) {
  return raw.replace("scope_", "Scope ");
}

export default function ReviewDashboard() {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [scope, setScope] = useState("");
  const [severity, setSeverity] = useState("");
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const params: Record<string, string> = {};
  if (source) params.source = source;
  if (reviewStatus) params.review_status = reviewStatus;
  if (scope) params.scope = scope;
  if (severity) params.severity = severity;
  if (issuesOnly) params.has_issues = "true";

  const summaryQuery = useQuery({
    queryKey: ["activity-summary"],
    queryFn: () => activitiesApi.summary(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["activities", params],
    queryFn: () => activitiesApi.list(params),
  });

  let rows = data?.results ?? [];
  if (issuesOnly && !params.has_issues) {
    rows = rows.filter((r) => (r.issue_count ?? 0) > 0);
  }

  const columns = useMemo(
    () => [
      helper.accessor("source_type", {
        header: "Source",
        cell: (c) => (
          <span className="font-medium capitalize text-slate-800">{c.getValue()}</span>
        ),
      }),
      helper.accessor("activity_type", {
        header: "Activity",
        cell: (c) => (
          <span className="capitalize text-slate-700">
            {c.getValue().replace(/_/g, " ")}
          </span>
        ),
      }),
      helper.accessor("scope", {
        header: "Scope",
        cell: (c) => (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
            {formatScope(c.getValue())}
          </span>
        ),
      }),
      helper.accessor("activity_date", {
        header: "Date",
        cell: (c) => {
          const v = c.getValue();
          return v ? (
            <span className="text-slate-600">{v}</span>
          ) : (
            <span className="text-slate-300">—</span>
          );
        },
      }),
      helper.accessor("amount_display", {
        header: "Amount",
        cell: (c) => (
          <span className={c.getValue() ? "text-slate-700" : "text-slate-300"}>
            {c.getValue() || "—"}
          </span>
        ),
      }),
      helper.accessor("estimated_emissions_kgco2e", {
        header: "kgCO₂e",
        cell: (c) => {
          const v = c.getValue();
          return v != null ? (
            <span className="font-mono text-slate-700">{v.toFixed(1)}</span>
          ) : (
            <span className="text-slate-300">—</span>
          );
        },
      }),
      helper.accessor("review_status", {
        header: "Status",
        cell: (c) => {
          const cfg = statusConfig[c.getValue()] ?? { label: c.getValue(), classes: "bg-slate-100 text-slate-700" };
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
              {cfg.label}
            </span>
          );
        },
      }),
      helper.accessor("highest_severity", {
        header: "Severity",
        sortingFn: (a, b) => {
          const av = severityRank[a.original.highest_severity ?? ""] ?? 0;
          const bv = severityRank[b.original.highest_severity ?? ""] ?? 0;
          return av - bv;
        },
        cell: (c) => {
          const v = c.getValue();
          if (!v) return <span className="text-slate-300">—</span>;
          return (
            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${severityBadge[v]}`}>
              {v}
            </span>
          );
        },
      }),
      helper.accessor("issue_count", {
        header: "Issues",
        cell: (c) => {
          const v = c.getValue() ?? 0;
          return v > 0 ? (
            <span className="font-medium text-amber-700">{v}</span>
          ) : (
            <span className="text-slate-300">0</span>
          );
        },
      }),
      helper.display({
        id: "actions",
        header: "",
        cell: () => (
          <ChevronRight className="ml-auto h-4 w-4 text-slate-300 transition group-hover:text-brand-600" />
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-950 text-white">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-brand-950">Review dashboard</h1>
          <p className="text-sm text-slate-500">
            Inspect, approve, and lock activities before they go to auditors.
          </p>
        </div>
      </div>

      <SummaryBanner summary={summaryQuery.data} loading={summaryQuery.isLoading} />

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span className="font-medium">Status:</span>
        </div>
        {statusPills.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setReviewStatus(p.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              reviewStatus === p.value
                ? "bg-brand-950 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-800"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIssuesOnly(!issuesOnly)}
          className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            issuesOnly
              ? "bg-amber-600 text-white shadow-sm"
              : "border border-amber-300 text-amber-700 hover:bg-amber-50"
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          Issues only
        </button>
      </div>

      {/* Secondary filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          {
            value: source,
            setter: setSource,
            options: [
              { value: "", label: "All sources" },
              { value: "sap", label: "SAP" },
              { value: "utility", label: "Utility" },
              { value: "travel", label: "Travel" },
            ],
          },
          {
            value: scope,
            setter: setScope,
            options: [
              { value: "", label: "All scopes" },
              { value: "scope_1", label: "Scope 1" },
              { value: "scope_2", label: "Scope 2" },
              { value: "scope_3", label: "Scope 3" },
            ],
          },
          {
            value: severity,
            setter: setSeverity,
            options: [
              { value: "", label: "All severities" },
              { value: "high", label: "High severity" },
              { value: "medium", label: "Medium severity" },
              { value: "low", label: "Low severity" },
            ],
          },
        ].map((sel, i) => (
          <select
            key={i}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            value={sel.value}
            onChange={(e) => sel.setter(e.target.value)}
          >
            {sel.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-10 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading activities…
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="cursor-pointer select-none px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition hover:text-slate-700"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                        {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ClipboardList className="h-8 w-8 text-slate-200" />
                      <p className="text-sm">No activities match your filters.</p>
                      <p className="text-xs">Upload a sample file on the Upload page to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group cursor-pointer border-b border-slate-50 transition hover:bg-slate-50"
                    onClick={() => navigate(`/activities/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Row count */}
      {!isLoading && rows.length > 0 && (
        <p className="mt-2 text-right text-xs text-slate-400">
          {rows.length} {rows.length === 1 ? "activity" : "activities"}
        </p>
      )}
    </div>
  );
}
