export const severityBadge: Record<string, string> = {
  high: "bg-red-600 text-white font-semibold",
  medium: "bg-amber-600 text-white font-semibold",
  low: "bg-slate-600 text-white font-medium",
};

export const severityRow: Record<string, string> = {
  high: "border-l-4 border-l-red-600 bg-red-50/80",
  medium: "border-l-4 border-l-amber-600 bg-amber-50/80",
  low: "border-l-4 border-l-slate-500 bg-slate-50/80",
};

export const severityRank: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function formatIssueType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
