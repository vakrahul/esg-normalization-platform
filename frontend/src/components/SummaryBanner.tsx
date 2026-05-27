import type { ActivitySummary } from "../api/client";

interface Props {
  summary: ActivitySummary | undefined;
  loading?: boolean;
}

export default function SummaryBanner({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="mb-4 rounded-xl border bg-white/90 px-4 py-3 text-sm text-slate-500">
        Loading summary…
      </div>
    );
  }
  if (!summary) return null;

  const items = [
    { label: "Total records", value: summary.total, tone: "text-brand-950" },
    { label: "Imported", value: summary.imported, tone: "text-slate-800" },
    { label: "Flagged", value: summary.flagged, tone: "text-amber-700" },
    { label: "Approved", value: summary.approved, tone: "text-emerald-700" },
    { label: "Rejected", value: summary.rejected, tone: "text-red-700" },
    { label: "Locked", value: summary.locked, tone: "text-brand-800" },
    { label: "With issues", value: summary.with_issues, tone: "text-amber-800" },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-brand-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3 sm:grid-cols-4 lg:grid-cols-7">
      {items.map((item) => (
        <div key={item.label} className="text-center sm:text-left">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            {item.label}
          </p>
          <p className={`text-lg font-semibold ${item.tone}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
