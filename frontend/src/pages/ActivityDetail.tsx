import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { activitiesApi } from "../api/client";
import ActivityTimeline from "../components/ActivityTimeline";
import ReviewActionsBar from "../components/ReviewActionsBar";
import ValidationIssuesPanel from "../components/ValidationIssuesPanel";
import { severityBadge } from "../lib/severity";

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const activityId = Number(id);
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ["activity", activityId],
    queryFn: () => activitiesApi.get(activityId),
    enabled: !Number.isNaN(activityId),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["activity", activityId] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["activity-summary"] });
  };

  const approveMut = useMutation({
    mutationFn: () => activitiesApi.approve(activityId, comment),
    onSuccess: () => {
      setActionMsg("Activity approved.");
      invalidate();
    },
    onError: (e: Error) => setActionMsg(e.message),
  });

  const rejectMut = useMutation({
    mutationFn: () => activitiesApi.reject(activityId, comment),
    onSuccess: () => {
      setActionMsg("Activity rejected.");
      invalidate();
    },
    onError: (e: Error) => setActionMsg(e.message),
  });

  const lockMut = useMutation({
    mutationFn: () => activitiesApi.lock(activityId),
    onSuccess: () => {
      setActionMsg("Activity locked for audit.");
      invalidate();
    },
    onError: (e: Error) => setActionMsg(e.message),
  });

  const isPending = approveMut.isPending || rejectMut.isPending || lockMut.isPending;

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading activity…</p>;
  }

  if (error || !activity) {
    return (
      <div>
        <p className="text-red-600">Could not load activity.</p>
        <Link to="/review" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
          Back to review
        </Link>
      </div>
    );
  }

  const canAct = !activity.locked_for_audit;
  const canLock = activity.review_status === "approved" && canAct;
  const issues = activity.validation_issues ?? [];

  return (
    <div className="space-y-4">
      <Link to="/review" className="text-xs text-brand-600 hover:underline">
        Back to review
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-brand-950 capitalize">
            {activity.activity_type.replace(/_/g, " ")}
          </h1>
          <p className="text-xs text-slate-600">
            Ref {activity.source_reference_id || "—"} · {activity.source_type} · {activity.scope}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs capitalize text-slate-800">
            {activity.review_status}
          </span>
          {activity.highest_severity && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs capitalize ${severityBadge[activity.highest_severity]}`}
            >
              {activity.highest_severity}
            </span>
          )}
        </div>
      </div>

      {actionMsg && (
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-brand-800">{actionMsg}</p>
      )}

      <ReviewActionsBar
        comment={comment}
        onCommentChange={setComment}
        onApprove={() => approveMut.mutate()}
        onReject={() => rejectMut.mutate()}
        onLock={() => lockMut.mutate()}
        canAct={canAct}
        canLock={canLock}
        reviewStatus={activity.review_status}
        locked={activity.locked_for_audit}
        pending={isPending}
      />

      <ValidationIssuesPanel issues={issues} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border bg-white px-4 py-3 shadow-sm">
            <h2 className="text-xs font-semibold uppercase text-brand-950">Normalized activity</h2>
            <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
              <dt className="text-slate-500">Date</dt>
              <dd className="col-span-2">{activity.activity_date || "—"}</dd>
              <dt className="text-slate-500">Amount</dt>
              <dd className="col-span-2">{activity.amount_display}</dd>
              <dt className="text-slate-500">Emissions</dt>
              <dd className="col-span-2">
                {activity.estimated_emissions_kgco2e != null
                  ? `${activity.estimated_emissions_kgco2e.toFixed(2)} kgCO2e`
                  : "—"}
              </dd>
              <dt className="text-slate-500">Facility</dt>
              <dd className="col-span-2">{activity.facility || "—"}</dd>
              <dt className="text-slate-500">Vendor</dt>
              <dd className="col-span-2">{activity.vendor || "—"}</dd>
            </dl>
            {activity.review_comment && (
              <p className="mt-2 rounded bg-slate-50 p-2 text-xs">
                <span className="font-medium">Note: </span>
                {activity.review_comment}
              </p>
            )}
          </section>

          <section className="rounded-xl border bg-white px-4 py-3 shadow-sm">
            <h2 className="text-xs font-semibold uppercase text-brand-950">Metadata</h2>
            <pre className="mt-1 max-h-36 overflow-auto rounded bg-slate-50 p-2 text-[11px] leading-tight">
              {JSON.stringify(activity.metadata ?? {}, null, 2)}
            </pre>
          </section>

          <section className="rounded-xl border bg-white px-4 py-3 shadow-sm">
            <h2 className="text-xs font-semibold uppercase text-brand-950">Raw payload</h2>
            <pre className="mt-1 max-h-36 overflow-auto rounded bg-slate-50 p-2 text-[11px] leading-tight">
              {JSON.stringify(activity.raw_record?.raw_payload ?? {}, null, 2)}
            </pre>
            {activity.raw_record?.processing_error && (
              <p className="mt-1 text-xs text-red-600">{activity.raw_record.processing_error}</p>
            )}
          </section>
        </div>

        <ActivityTimeline activity={activity} />
      </div>
    </div>
  );
}
