import type { ImportBatchDetail } from "../api/client";

interface Props {
  batch: ImportBatchDetail | null;
  onClose: () => void;
}

export default function BatchDetailModal({ batch, onClose }: Props) {
  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-xl text-brand-950">Batch #{batch.id}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500">Source</dt>
          <dd className="font-medium capitalize">{batch.source_type}</dd>
          <dt className="text-slate-500">File</dt>
          <dd className="truncate font-medium">{batch.original_filename || "—"}</dd>
          <dt className="text-slate-500">Imported</dt>
          <dd>{new Date(batch.imported_at).toLocaleString()}</dd>
          <dt className="text-slate-500">Status</dt>
          <dd className="capitalize">{batch.status}</dd>
          <dt className="text-slate-500">Rows</dt>
          <dd>{batch.row_count}</dd>
          <dt className="text-slate-500">Success</dt>
          <dd className="text-emerald-700">{batch.success_count}</dd>
          <dt className="text-slate-500">Flagged</dt>
          <dd className="text-amber-700">{batch.flagged_count}</dd>
          <dt className="text-slate-500">Failed</dt>
          <dd className="text-red-700">{batch.failed_count}</dd>
        </dl>
        {batch.failure_summary?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase text-slate-600">Failure summary</h3>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-red-800">
              {batch.failure_summary.map((f) => (
                <li key={f.row_number}>
                  Row {f.row_number}: {f.error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">
          {batch.issue_count} normalized record(s) in this batch have validation issues.
        </p>
      </div>
    </div>
  );
}
