import { severityBadge, severityRow, formatIssueType } from "../lib/severity";

interface Issue {
  id: number;
  severity: string;
  issue_type: string;
  message: string;
  resolved: boolean;
}

interface Props {
  issues: Issue[];
}

export default function ValidationIssuesPanel({ issues }: Props) {
  const open = issues.filter((i) => !i.resolved);

  return (
    <section className="rounded-xl border-2 border-amber-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/60 px-4 py-2.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-950">
          Validation issues
        </h2>
        <span className="rounded-full bg-brand-950 px-2.5 py-0.5 text-xs font-medium text-white">
          {open.length} open
        </span>
      </div>
      {open.length === 0 ? (
        <p className="px-4 py-3 text-sm text-slate-600">No open validation issues.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Issue</th>
                <th className="px-4 py-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {open.map((issue) => (
                <tr key={issue.id} className={`border-t ${severityRow[issue.severity] || ""}`}>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs capitalize ${severityBadge[issue.severity] || ""}`}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {formatIssueType(issue.issue_type)}
                  </td>
                  <td className="px-4 py-2 text-slate-700">{issue.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
