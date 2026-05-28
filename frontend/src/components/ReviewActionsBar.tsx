import { CheckCircle2, Lock, Loader2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";

interface Props {
  comment: string;
  onCommentChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onLock: () => void;
  canAct: boolean;
  canLock: boolean;
  reviewStatus: string;
  locked: boolean;
  pending: boolean;
}

export default function ReviewActionsBar({
  comment,
  onCommentChange,
  onApprove,
  onReject,
  onLock,
  canAct,
  canLock,
  reviewStatus,
  locked,
  pending,
}: Props) {
  if (locked) {
    return (
      <section className="sticky top-4 z-10 flex items-center gap-3 rounded-2xl border-2 border-brand-800 bg-brand-950 px-5 py-3.5 text-white shadow-lg">
        <Lock className="h-5 w-5 shrink-0 text-brand-300" />
        <p className="text-sm font-medium">
          This activity is locked for audit and cannot be modified.
        </p>
      </section>
    );
  }

  return (
    <section className="sticky top-4 z-10 rounded-2xl border-2 border-brand-100 bg-white px-5 py-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-brand-700" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-950">
          Review actions
        </h2>
      </div>

      <label className="block text-xs font-medium text-slate-500 mb-1">
        Analyst comment (optional)
      </label>
      <textarea
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
        rows={2}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="e.g. Confirmed with facilities team. Approved."
        disabled={!canAct}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {/* Approve */}
        <button
          type="button"
          onClick={onApprove}
          disabled={pending || reviewStatus === "approved" || !canAct}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Approve
        </button>

        {/* Reject */}
        <button
          type="button"
          onClick={onReject}
          disabled={pending || !canAct}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Reject
        </button>

        {/* Lock for audit */}
        <button
          type="button"
          onClick={onLock}
          disabled={!canLock || pending}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-900 shadow-sm transition hover:bg-brand-50 disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          Lock for audit
        </button>
      </div>

      {canAct && !canLock && reviewStatus !== "approved" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
          <ShieldAlert className="h-3.5 w-3.5" />
          Approve this activity before locking for audit.
        </div>
      )}
    </section>
  );
}
