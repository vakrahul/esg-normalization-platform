# Presenter demo script (~3 minutes)

Use this while screen-sharing the **deployed** app. Clear demo data first (Upload → **Clear demo data**).

---

## 0:00 — Problem (15 sec)

> "Enterprise clients send SAP procurement exports, utility portal CSVs, and travel platform JSON — all different shapes. Breathe needs one canonical activity model and analyst sign-off before auditors see the data. Carbon math is not the hard part; ingestion and trust are."

---

## 0:15 — Landing (20 sec)

> "We researched real formats: SAP Ariba-style accounting columns, Oracle Green Button utility exports, and Concur itinerary JSON. The landing links are the references we used."

Click **Analyst sign in**.

---

## 0:35 — Upload / ingest (60 sec)

> "Each upload creates a new import batch. Raw rows are stored immutably — we never overwrite source data."

1. Upload `samples/sap_budget_export.csv` → point at batch row: success + flagged counts.
2. Upload `samples/utility_billing.csv`.
3. Click **Sync domestic** (travel).
4. Optional: upload `samples/sap_export_de_variant.csv` → "German SAP headers map to our canonical fields."

Click a batch row → batch detail modal → failed rows if any.

---

## 1:35 — Review dashboard (45 sec)

> "Analysts see everything that came in, what looks suspicious, and what is ready for audit."

Open **Review** → summary banner (flagged / approved / locked).

Filter **Flagged** → sort by severity → open one row.

---

## 2:20 — Activity detail / audit (50 sec)

> "Validation issues explain *why* a row is suspicious — missing currency, estimated utility read, unknown airport, etc."

1. Show **Validation issues** table.
2. Show **Timeline** (imported → normalized → flagged).
3. Expand **Raw source payload** (read-only): "This is the exact source row for lineage."
4. Approve with comment → **Lock for audit** → show audit trail updated.

> "Locked rows cannot be edited. Re-imports create a new batch; old raw data stays unchanged."

---

## 3:10 — Docs & tradeoffs (20 sec)

> "MODEL.md covers tenancy, scopes, immutability, and audit. DECISIONS and SOURCES defend our SAP CSV subset vs IDoc, CSV vs PDF utility, and fixture travel vs live OAuth. TRADEOFFS.md lists three things we deliberately did not build: PDF OCR, live SAP/Concur connectors, and a real emissions factor engine."

---

## Q&A prep (one-liners)

| Question | Answer |
|----------|--------|
| Why flat SAP CSV? | Fastest path to demo normalization + validation; IDoc/OData next with same RawRecord layer. |
| Multi-tenant? | `Organization` FK on all activities; prototype uses one client; schema supports many orgs in production. |
| How do you know data wasn't tampered? | Immutable `RawRecord`, append-only `AuditLog`, lock after approve. |
| What's not built? | PDF bills, live enterprise APIs, real factor library — see TRADEOFFS.md. |
