import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { importsApi, ImportBatch } from "../api/client";
import BatchDetailModal from "../components/BatchDetailModal";
import PillButton from "../components/PillButton";

const SAMPLE_FILES = {
  sap: [
    "sap_budget_export.csv",
    "sap_procurement_q2.csv",
    "sap_fuel_india.csv",
    "sap_export_de_variant.csv (German headers)",
  ],
  utility: [
    "utility_billing.csv",
    "utility_campus_north.csv",
    "utility_campus_south.csv",
  ],
  travel: [
    "travel_domestic_trips.json (sync: domestic)",
    "travel_international_trips.json (sync: international)",
    "Any Concur-style JSON array (file upload)",
  ],
};

function BatchTable({
  batches,
  onSelect,
}: {
  batches: ImportBatch[];
  onSelect: (id: number) => void;
}) {
  return (
    <table className="mt-4 w-full text-left text-xs">
      <thead>
        <tr className="border-b text-slate-500">
          <th className="py-2">ID</th>
          <th>Source</th>
          <th>Status</th>
          <th>Rows</th>
          <th>Success</th>
          <th>Flagged</th>
          <th>Failed</th>
        </tr>
      </thead>
      <tbody>
        {batches.map((b) => (
          <tr
            key={b.id}
            className="cursor-pointer border-b border-slate-100 hover:bg-emerald-50/50"
            onClick={() => onSelect(b.id)}
          >
            <td className="py-2 font-medium text-brand-700">{b.id}</td>
            <td>{b.source_type}</td>
            <td className="capitalize">{b.status}</td>
            <td>{b.row_count}</td>
            <td>{b.success_count}</td>
            <td>{b.flagged_count}</td>
            <td>{b.failed_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Upload() {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
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
    setMessage(`${label} import completed.`);
    qc.invalidateQueries({ queryKey: ["batches"] });
    qc.invalidateQueries({ queryKey: ["activities"] });
    qc.invalidateQueries({ queryKey: ["activity-summary"] });
  };

  const sapMut = useMutation({
    mutationFn: (f: File) => importsApi.sap(f),
    onSuccess: () => onSuccess("SAP"),
    onError: (e: Error) => setMessage(e.message),
  });
  const utilMut = useMutation({
    mutationFn: (f: File) => importsApi.utility(f),
    onSuccess: () => onSuccess("Utility"),
    onError: (e: Error) => setMessage(e.message),
  });
  const travelFileMut = useMutation({
    mutationFn: (f: File) => importsApi.travelJson(f),
    onSuccess: () => onSuccess("Travel"),
    onError: (e: Error) => setMessage(e.message),
  });
  const travelSyncMut = useMutation({
    mutationFn: (d: "default" | "domestic" | "international") => importsApi.travelSync(d),
    onSuccess: (_, d) => onSuccess(`Travel (${d})`),
    onError: (e: Error) => setMessage(e.message),
  });
  const resetMut = useMutation({
    mutationFn: () => importsApi.resetDemo(),
    onSuccess: (res) => {
      setMessage(`Demo data cleared (${res.deleted_rows} rows removed).`);
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["activity-summary"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-950">Data upload</h1>
      <p className="mt-1 text-sm text-slate-600">
        Upload any CSV or travel JSON that matches the sample column layout. Each file creates a new
        import batch.
      </p>
      {message && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">{message}</p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-brand-950">SAP CSV</h3>
          <p className="mt-1 text-[11px] text-slate-500">Same headers as sample files in /samples</p>
          <input
            type="file"
            accept=".csv"
            className="mt-3 block w-full text-xs"
            onChange={(e) => e.target.files?.[0] && sapMut.mutate(e.target.files[0])}
          />
          <ul className="mt-2 list-inside list-disc text-[10px] text-slate-500">
            {SAMPLE_FILES.sap.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-brand-950">Utility CSV</h3>
          <p className="mt-1 text-[11px] text-slate-500">account_number, meter_id, billing dates, usage</p>
          <input
            type="file"
            accept=".csv"
            className="mt-3 block w-full text-xs"
            onChange={(e) => e.target.files?.[0] && utilMut.mutate(e.target.files[0])}
          />
          <ul className="mt-2 list-inside list-disc text-[10px] text-slate-500">
            {SAMPLE_FILES.utility.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-medium text-brand-950">Travel</h3>
          <p className="mt-1 text-[11px] text-slate-500">JSON array or built-in sync datasets</p>
          <input
            type="file"
            accept=".json,application/json"
            className="mt-3 block w-full text-xs"
            onChange={(e) => e.target.files?.[0] && travelFileMut.mutate(e.target.files[0])}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <PillButton
              className="!px-3 !py-1.5 !text-xs"
              disabled={travelSyncMut.isPending}
              onClick={() => travelSyncMut.mutate("default")}
            >
              Sync default
            </PillButton>
            <PillButton
              variant="secondary"
              className="!px-3 !py-1.5 !text-xs"
              disabled={travelSyncMut.isPending}
              onClick={() => travelSyncMut.mutate("domestic")}
            >
              Sync domestic
            </PillButton>
            <PillButton
              variant="secondary"
              className="!px-3 !py-1.5 !text-xs"
              disabled={travelSyncMut.isPending}
              onClick={() => travelSyncMut.mutate("international")}
            >
              Sync intl
            </PillButton>
          </div>
          <ul className="mt-2 list-inside list-disc text-[10px] text-slate-500">
            {SAMPLE_FILES.travel.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Recent import batches</h2>
            <p className="text-[11px] text-slate-500">Click a row for batch details</p>
          </div>
          <PillButton
            variant="secondary"
            className="!px-3 !py-1.5 !text-xs !text-rose-800 !border-rose-200 hover:!bg-rose-50"
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
          >
            Clear demo data
          </PillButton>
        </div>
        {batchesQuery.isLoading && <p className="mt-3 text-xs text-slate-500">Loading…</p>}
        {batchesQuery.data && batchesQuery.data.length === 0 && (
          <p className="mt-4 text-xs text-slate-500">No batches yet. Upload a sample file or sync travel.</p>
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
