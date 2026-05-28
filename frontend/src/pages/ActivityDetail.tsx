import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { activitiesApi } from "../api/client";
import ActivityTimeline from "../components/ActivityTimeline";
import ReviewActionsBar from "../components/ReviewActionsBar";
import ValidationIssuesPanel from "../components/ValidationIssuesPanel";
import { severityBadge } from "../lib/severity";

function formatScope(raw: string) {
  return raw.replace("scope_", "Scope ");
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const activityId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionIsError, setActionIsError] = useState(false);

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
      setActionMsg("Activity approved successfully.");
      setActionIsError(false);
      invalidate();
    },
    onError: (e: Error) => {
      setActionMsg(e.message);
      setActionIsError(true);
    },
  });

  const rejectMut = useMutation({
    mutationFn: () => activitiesApi.reject(activityId, comment),
    onSuccess: () => {
      setActionMsg("Activity rejected.");
      setActionIsError(false);
      invalidate();
    },
    onError: (e: Error) => {
      setActionMsg(e.message);
      setActionIsError(true);
    },
  });

  const lockMut = useMutation({
    mutationFn: () => activitiesApi.lock(activityId),
    onSuccess: () => {
      setActionMsg("Activity locked for audit. Record is now immutable.");
      setActionIsError(false);
      invalidate();
    },
    onError: (e: Error) => {
      setActionMsg(e.message);
      setActionIsError(true);
    },
  });

  const isPending = approveMut.isPending || rejectMut.isPending || lockMut.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading activity…
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-800">Could not load activity.</p>
        <button
          onClick={() => navigate("/review")}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to review
        </button>
      </div>
    );
  }

  const canAct = !activity.locked_for_audit;
  const canLock = activity.review_status === "approved" && canAct;
  const issues = activity.validation_issues ?? [];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Link
        to="/review"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Review dashboard
      </Link>

      {/* Locked banner */}
      {activity.locked_for_audit && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-300 bg-brand-950 px-5 py-3 text-white shadow-sm">
          <Lock className="h-5 w-5 shrink-0 text-brand-300" />
          <div>
            <p className="text-sm font-semibold">Locked for audit</p>
            <p className="text-xs text-brand-300">
              {activity.locked_at
                ? `Locked ${new Date(activity.locked_at).toLocaleString()} · `
                : ""}
              Record is immutable — no further changes permitted.
            </p>
          </div>
        </div>
      )}

      {/* Activity header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-brand-950 capitalize">
            {activity.activity_type.replace(/_/g, " ")}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium capitalize text-slate-700">
              {activity.source_type}
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-800">
              {formatScope(activity.scope)}
            </span>
            {activity.source_reference_id && (
              <span>Ref {activity.source_reference_id}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {/* Review status badge */}
          {(() => {
            const statusMap: Record<string, string> = {
              pending: "bg-slate-100 text-slate-700",
              flagged: "bg-amber-100 text-amber-800",
              approved: "bg-emerald-100 text-emerald-800",
              rejected: "bg-red-100 text-red-800",
            };
            return (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  statusMap[activity.review_status] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {activity.review_status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                {activity.review_status === "locked" && <Lock className="h-3 w-3" />}
                {activity.review_status}
              </span>
            );
          })()}
          {activity.highest_severity && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${severityBadge[activity.highest_severity]}`}
            >
              {activity.highest_severity}
            </span>
          )}
        </div>
      </div>

      {/* Action feedback */}
      {actionMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
            actionIsError
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {actionIsError ? (
            <FileText className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          {actionMsg}
        </div>
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
          {/* Normalized activity */}
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-950">
                Normalized activity
              </h2>
            </div>
            <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
              {[
                { label: "Date", value: activity.activity_date || "—" },
                { label: "Amount", value: activity.amount_display || "—" },
                {
                  label: "Emissions",
                  value:
                    activity.estimated_emissions_kgco2e != null
                      ? `${activity.estimated_emissions_kgco2e.toFixed(2)} kgCO₂e`
                      : "—",
                },
                { label: "Facility", value: activity.facility || "—" },
                { label: "Vendor", value: activity.vendor || "—" },
                { label: "Scope", value: formatScope(activity.scope) },
              ].map(({ label, value }) => (
                <>
                  <dt key={`dt-${label}`} className="text-slate-400">{label}</dt>
                  <dd key={`dd-${label}`} className="col-span-2 font-medium text-slate-800">
                    {value}
                  </dd>
                </>
              ))}
            </dl>
            {activity.review_comment && (
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <span className="font-semibold text-slate-600">Analyst note: </span>
                <span className="text-slate-700">{activity.review_comment}</span>
              </div>
            )}
          </section>

          {/* Metadata */}
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-950">
                Source metadata
              </h2>
            </div>
            <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
              {JSON.stringify(activity.metadata ?? {}, null, 2)}
            </pre>
          </section>

          {/* Raw payload */}
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-950">
                Raw payload
              </h2>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                immutable
              </span>
            </div>
            <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
              {JSON.stringify(activity.raw_record?.raw_payload ?? {}, null, 2)}
            </pre>
            {activity.raw_record?.processing_error && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {activity.raw_record.processing_error}
              </p>
            )}
          </section>
        </div>

        <ActivityTimeline activity={activity} />
      </div>
    </div>
  );
}
