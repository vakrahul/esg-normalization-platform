import type { Activity } from "../api/client";

interface TimelineEvent {
  label: string;
  at: string | null;
  detail?: string;
  done: boolean;
}

function buildTimeline(activity: Activity): TimelineEvent[] {
  const imported = activity.raw_record?.created_at ?? activity.created_at;
  const logs = activity.audit_logs ?? [];

  const normalized = logs.find((l) => l.action === "normalized");
  const approved = logs.find((l) => l.action === "approved");
  const locked = logs.find((l) => l.action === "locked");

  const flagged =
    activity.review_status === "flagged" ||
    (activity.validation_issues?.some((i) => !i.resolved) ?? false);

  return [
    {
      label: "Imported",
      at: imported,
      detail: `Batch row ${activity.raw_record?.row_number ?? "—"}`,
      done: true,
    },
    {
      label: "Normalized",
      at: normalized?.changed_at ?? activity.created_at,
      detail: `${activity.activity_type} · ${activity.scope}`,
      done: !!normalized || activity.raw_record?.processing_status === "processed",
    },
    {
      label: "Flagged for review",
      at: flagged ? activity.created_at : null,
      detail: flagged ? `${activity.issue_count ?? 0} validation issue(s)` : undefined,
      done: flagged,
    },
    {
      label: "Approved by analyst",
      at: activity.approved_at ?? approved?.changed_at ?? null,
      detail: approved?.changed_by_username
        ? `By ${approved.changed_by_username}`
        : undefined,
      done: activity.review_status === "approved" || activity.review_status === "rejected"
        ? activity.review_status === "approved"
        : false,
    },
    {
      label: "Locked for audit",
      at: activity.locked_at ?? locked?.changed_at ?? null,
      detail: activity.locked_for_audit ? "Immutable record" : undefined,
      done: activity.locked_for_audit,
    },
  ];
}

export default function ActivityTimeline({ activity }: { activity: Activity }) {
  const events = buildTimeline(activity);

  return (
    <section className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-950">
        Activity timeline
      </h2>
      <ol className="mt-3 space-y-0">
        {events.map((ev, i) => (
          <li key={ev.label} className="relative flex gap-3 pb-4 last:pb-0">
            {i < events.length - 1 && (
              <span
                className={`absolute left-[7px] top-4 h-full w-0.5 ${ev.done ? "bg-brand-600" : "bg-slate-200"}`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                ev.done ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${ev.done ? "text-brand-950" : "text-slate-400"}`}>
                {ev.label}
              </p>
              {ev.at && (
                <p className="text-xs text-slate-500">{new Date(ev.at).toLocaleString()}</p>
              )}
              {ev.detail && <p className="text-xs text-slate-600">{ev.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
