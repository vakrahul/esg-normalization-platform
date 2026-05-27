import PillButton from "./PillButton";

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
      <section className="sticky top-4 z-10 rounded-xl border-2 border-brand-800 bg-brand-950 px-4 py-3 text-white shadow-lg">
        <p className="text-sm font-medium">This activity is locked for audit and cannot be modified.</p>
      </section>
    );
  }

  return (
    <section className="sticky top-4 z-10 rounded-xl border-2 border-brand-200 bg-white px-4 py-3 shadow-lg">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-950">
        Review actions
      </h2>
      <label className="mt-2 block text-xs font-medium text-slate-600">Analyst comment</label>
      <textarea
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        rows={2}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="e.g. Confirmed with facilities team."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <PillButton
          type="button"
          onClick={onApprove}
          disabled={pending || reviewStatus === "approved"}
          className="!bg-emerald-700 hover:!bg-emerald-800"
        >
          Approve
        </PillButton>
        <PillButton type="button" variant="secondary" onClick={onReject} disabled={pending}>
          Reject
        </PillButton>
        <PillButton
          type="button"
          variant="secondary"
          onClick={onLock}
          disabled={!canLock || pending}
          className="!border-brand-800 !text-brand-950"
        >
          Lock for audit
        </PillButton>
      </div>
      {!canAct && (
        <p className="mt-2 text-xs text-slate-500">Actions unavailable while record is locked.</p>
      )}
      {canAct && !canLock && reviewStatus !== "approved" && (
        <p className="mt-2 text-xs text-amber-700">Approve this activity before locking for audit.</p>
      )}
    </section>
  );
}
