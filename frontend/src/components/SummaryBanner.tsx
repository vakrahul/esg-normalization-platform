import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Import,
  Lock,
  XCircle,
} from "lucide-react";
import type { ActivitySummary } from "../api/client";

interface Props {
  summary: ActivitySummary | undefined;
  loading?: boolean;
}

const items = (s: ActivitySummary) => [
  {
    label: "Total",
    value: s.total,
    icon: <ClipboardList className="h-4 w-4" />,
    tone: "text-brand-950",
    iconTone: "text-brand-300",
    bg: "bg-brand-50",
  },
  {
    label: "Imported",
    value: s.imported,
    icon: <Import className="h-4 w-4" />,
    tone: "text-slate-800",
    iconTone: "text-slate-400",
    bg: "bg-slate-50",
  },
  {
    label: "Flagged",
    value: s.flagged,
    icon: <AlertTriangle className="h-4 w-4" />,
    tone: "text-amber-700",
    iconTone: "text-amber-400",
    bg: "bg-amber-50",
  },
  {
    label: "Approved",
    value: s.approved,
    icon: <CheckCircle2 className="h-4 w-4" />,
    tone: "text-emerald-700",
    iconTone: "text-emerald-400",
    bg: "bg-emerald-50",
  },
  {
    label: "Rejected",
    value: s.rejected,
    icon: <XCircle className="h-4 w-4" />,
    tone: "text-red-700",
    iconTone: "text-red-400",
    bg: "bg-red-50",
  },
  {
    label: "Locked",
    value: s.locked,
    icon: <Lock className="h-4 w-4" />,
    tone: "text-brand-800",
    iconTone: "text-brand-400",
    bg: "bg-brand-50",
  },
  {
    label: "With issues",
    value: s.with_issues,
    icon: <AlertTriangle className="h-4 w-4" />,
    tone: "text-amber-800",
    iconTone: "text-amber-500",
    bg: "bg-amber-50",
  },
];

export default function SummaryBanner({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="mb-4 grid animate-pulse grid-cols-7 gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }
  if (!summary) return null;

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {items(summary).map((item) => (
        <div
          key={item.label}
          className={`flex flex-col gap-1 rounded-xl border border-transparent px-3 py-2.5 ${item.bg} transition hover:shadow-sm`}
        >
          <div className={`flex items-center gap-1.5 ${item.iconTone}`}>
            {item.icon}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {item.label}
            </span>
          </div>
          <p className={`text-xl font-bold leading-none ${item.tone}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
