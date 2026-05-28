import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Database,
  Loader2,
  Plane,
  RefreshCw,
  Trash2,
  UploadCloud,
  Zap,
} from "lucide-react";
import { DragEvent, useRef, useState } from "react";
import { importsApi, ImportBatch } from "../api/client";
import BatchDetailModal from "../components/BatchDetailModal";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-800",
    processing: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        map[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Batch table ──────────────────────────────────────────────────────────────
function BatchTable({
  batches,
  onSelect,
}: {
  batches: ImportBatch[];
  onSelect: (id: number) => void;
}) {
  return (
    <table className="mt-2 w-full text-left text-xs">
      <thead>
        <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <th className="py-2.5 pl-3">ID</th>
          <th>Source</th>
          <th>Status</th>
          <th className="text-right pr-3">Rows</th>
          <th className="text-right pr-3">Flagged</th>
          <th className="text-right pr-3">Failed</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {batches.map((b) => (
          <tr
            key={b.id}
            className="group cursor-pointer border-b border-slate-50 transition hover:bg-slate-50"
            onClick={() => onSelect(b.id)}
          >
            <td className="py-2.5 pl-3 font-mono text-slate-400">#{b.id}</td>
            <td>
              <span className="font-medium capitalize text-slate-700">{b.source_type}</span>
            </td>
            <td>
              <StatusBadge status={b.status} />
            </td>
            <td className="text-right pr-3 text-slate-600">{b.row_count}</td>
            <td className="text-right pr-3">
              {b.flagged_count > 0 ? (
                <span className="font-medium text-amber-700">{b.flagged_count}</span>
              ) : (
                <span className="text-slate-400">0</span>
              )}
            </td>
            <td className="text-right pr-3">
              {b.failed_count > 0 ? (
                <span className="font-medium text-red-600">{b.failed_count}</span>
              ) : (
                <span className="text-slate-400">0</span>
              )}
            </td>
            <td className="pr-3 text-right">
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-500" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Drag-and-drop upload card ─────────────────────────────────────────────────
interface UploadCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accept: string;
  isPending: boolean;
  isSuccess: boolean;
  onFile: (f: File) => void;
  extra?: React.ReactNode;
}

function UploadCard({
  icon,
  title,
  subtitle,
  accept,
  isPending,
  isSuccess,
  onFile,
  extra,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFileName(f.name);
      onFile(f);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      onFile(f);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`mx-4 my-3 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition ${
          dragging
            ? "border-brand-500 bg-brand-50/60"
            : isSuccess
            ? "border-emerald-400 bg-emerald-50/50"
            : "border-slate-200 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/30"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {isPending ? (
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        ) : isSuccess ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        ) : (
          <UploadCloud
            className={`h-6 w-6 ${dragging ? "text-brand-600" : "text-slate-400"}`}
          />
        )}
        <p className="mt-2 text-xs text-slate-500">
          {isPending
            ? "Uploading…"
            : isSuccess
            ? "Uploaded"
            : fileName
            ? fileName
            : "Drop file here or click to browse"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Optional extra (sync buttons for travel) */}
      {extra && <div className="px-4 pb-4">{extra}</div>}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Upload() {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  const batchesQuery = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const data = await importsApi.batches();
      return Array.isArray(data) ? data : data.results;
    },
  });

  const batchDetailQuery = useQuery({
    queryKey: ["batch", selectedBatchId],
    queryFn: () => importsApi.batchDetail(selectedBatchId!),
    enabled: selectedBatchId != null,
  });

  const onSuccess = (label: string) => {
    setMessage(`${label} import completed successfully.`);
    setMessageIsError(false);
    qc.invalidateQueries({ queryKey: ["batches"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["activity-summary"] });
  };

  const onError = (e: Error) => {
    setMessage(e.message);
    setMessageIsError(true);
  };

  const sapMut = useMutation({
    mutationFn: (f: File) => importsApi.sap(f),
    onSuccess: () => onSuccess("SAP"),
    onError,
  });
  const utilMut = useMutation({
    mutationFn: (f: File) => importsApi.utility(f),
    onSuccess: () => onSuccess("Utility"),
    onError,
  });
  const travelFileMut = useMutation({
    mutationFn: (f: File) => importsApi.travelJson(f),
    onSuccess: () => onSuccess("Travel"),
    onError,
  });
  const travelSyncMut = useMutation({
    mutationFn: (d: "default" | "domestic" | "international") => importsApi.travelSync(d),
    onSuccess: (_, d) => onSuccess(`Travel (${d})`),
    onError,
  });
  const resetMut = useMutation({
    mutationFn: () => importsApi.resetDemo(),
    onSuccess: (res) => {
      setMessage(`Demo data cleared — ${res.deleted_rows} rows removed.`);
      setMessageIsError(false);
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["activity-summary"] });
    },
    onError,
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-950 text-white">
          <CloudUpload className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-brand-950">Data upload</h1>
          <p className="text-sm text-slate-500">
            Upload source files or sync built-in datasets. Each upload creates a new import batch.
          </p>
        </div>
      </div>

      {/* Feedback banner */}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
            messageIsError
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {messageIsError ? (
            <Database className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          {message}
        </div>
      )}

      {/* Upload cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* SAP */}
        <UploadCard
          icon={<Building2 className="h-5 w-5" />}
          title="SAP CSV"
          subtitle="Ariba-style flat file export"
          accept=".csv"
          isPending={sapMut.isPending}
          isSuccess={sapMut.isSuccess}
          onFile={(f) => sapMut.mutate(f)}
        />

        {/* Utility */}
        <UploadCard
          icon={<Zap className="h-5 w-5" />}
          title="Utility CSV"
          subtitle="Green Button-style meter export"
          accept=".csv"
          isPending={utilMut.isPending}
          isSuccess={utilMut.isSuccess}
          onFile={(f) => utilMut.mutate(f)}
        />

        {/* Travel */}
        <UploadCard
          icon={<Plane className="h-5 w-5" />}
          title="Travel"
          subtitle="Concur-style itinerary JSON"
          accept=".json,application/json"
          isPending={travelFileMut.isPending}
          isSuccess={travelFileMut.isSuccess}
          onFile={(f) => travelFileMut.mutate(f)}
          extra={
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">Or sync a built-in dataset:</p>
              <div className="flex flex-wrap gap-2">
                {(["default", "domestic", "international"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={travelSyncMut.isPending}
                    onClick={() => travelSyncMut.mutate(d)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50"
                  >
                    {travelSyncMut.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* Recent batches */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Recent import batches</p>
              <p className="text-[11px] text-slate-400">Click a row for raw record details</p>
            </div>
          </div>
          <button
            type="button"
            disabled={resetMut.isPending}
            onClick={() => {
              if (
                window.confirm(
                  "Delete all import batches and review activities? This cannot be undone."
                )
              ) {
                resetMut.mutate();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {resetMut.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Clear demo data
          </button>
        </div>

        {batchesQuery.isLoading && (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading batches…
          </div>
        )}
        {batchesQuery.data && batchesQuery.data.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <UploadCloud className="h-8 w-8 text-slate-200" />
            <p className="text-sm text-slate-400">
              No batches yet. Upload a sample file or sync travel data above.
            </p>
          </div>
        )}
        {batchesQuery.data && batchesQuery.data.length > 0 && (
          <BatchTable batches={batchesQuery.data} onSelect={setSelectedBatchId} />
        )}
      </div>

      <BatchDetailModal
        batch={batchDetailQuery.data ?? null}
        onClose={() => setSelectedBatchId(null)}
      />
    </div>
  );
}
