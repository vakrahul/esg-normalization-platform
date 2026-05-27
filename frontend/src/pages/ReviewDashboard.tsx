import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { activitiesApi, Activity } from "../api/client";
import SummaryBanner from "../components/SummaryBanner";
import { severityBadge, severityRank } from "../lib/severity";

const helper = createColumnHelper<Activity>();

const statusPills = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function ReviewDashboard() {
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
      helper.accessor("source_type", { header: "Source" }),
      helper.accessor("activity_type", {
        header: "Type",
        cell: (c) => c.getValue().replace(/_/g, " "),
      }),
      helper.accessor("scope", { header: "Scope" }),
      helper.accessor("amount_display", { header: "Amount" }),
      helper.accessor("estimated_emissions_kgco2e", {
        header: "kgCO2e",
        cell: (c) => (c.getValue() != null ? c.getValue()!.toFixed(1) : "—"),
      }),
      helper.accessor("review_status", {
        header: "Status",
        cell: (c) => (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs capitalize">
            {c.getValue()}
          </span>
        ),
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
          if (!v) return "—";
          return (
            <span className={`rounded px-2 py-0.5 text-xs capitalize ${severityBadge[v]}`}>
              {v}
            </span>
          );
        },
      }),
      helper.accessor("issue_count", { header: "Issues" }),
      helper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link className="text-xs font-medium text-brand-600 hover:underline" to={`/activities/${row.original.id}`}>
            Review
          </Link>
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
      <h1 className="font-serif text-2xl text-brand-950">Review dashboard</h1>
      <SummaryBanner summary={summaryQuery.data} loading={summaryQuery.isLoading} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Status:</span>
        {statusPills.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setReviewStatus(p.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              reviewStatus === p.value
                ? "bg-brand-950 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:border-brand-300"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIssuesOnly(!issuesOnly)}
          className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${
            issuesOnly ? "bg-amber-600 text-white" : "border border-amber-300 text-amber-800"
          }`}
        >
          Issues only
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <select className="rounded-lg border px-2 py-1.5 text-xs" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          <option value="sap">SAP</option>
          <option value="utility">Utility</option>
          <option value="travel">Travel</option>
        </select>
        <select className="rounded-lg border px-2 py-1.5 text-xs" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="">All scopes</option>
          <option value="scope_1">Scope 1</option>
          <option value="scope_2">Scope 2</option>
          <option value="scope_3">Scope 3</option>
        </select>
        <select className="rounded-lg border px-2 py-1.5 text-xs" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white shadow-sm">
        {isLoading ? (
          <p className="p-4 text-xs text-slate-500">Loading activities…</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-slate-50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="cursor-pointer px-3 py-2 font-medium text-slate-600 select-none"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-blue-50/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
