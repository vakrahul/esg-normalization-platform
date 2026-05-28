# Deliberate tradeoffs

The assignment asked for three things we **chose not to build** and why. These are intentional scope cuts, not oversights.

---

## 1. Per-client column mapping templates for SAP

**What we skipped:** A configuration layer where each client's SAP export column names are mapped to our canonical schema via a stored template — e.g. `"Betrag"` → `spend_amount`, `"Buchungsdatum"` → `activity_date`, `"Buchungskreis"` → `facility`.

**Why this was a deliberate architectural choice:** Building a template UI and column-mapping engine would have shifted engineering focus from normalization logic to configuration management. The harder, more interesting problem is the pipeline itself — how a row becomes a `NormalizedActivity` with a Scope classification, validation issues, and an immutable audit trail. We hardcoded a small alias map (`normalization/reference.py`) that proves the concept works, and kept time on the data model.

**The architectural consequence:** Column mapping is fully isolated inside `SAPNormalizer`. Adding a configurable `ColumnMapping` table per `DataSource` — with a simple ops UI for header aliases — requires zero changes to the normalization or review layers. We designed for this extension without pre-building it.

**What we'd build next:** A `ColumnMapping` model on `DataSource`, a lightweight admin UI for ops teams to configure per-client header aliases before the first upload, and a mapping resolver called before normalization runs.

**What we'd ask the PM:** "Do all clients export from the same SAP module (Ariba, S/4 Finance, BW), or do we need to handle multiple export shapes per client?"

---

## 2. Idempotent re-ingestion and row supersession

**What we skipped:** Logic to detect when a re-uploaded SAP or utility file contains corrected rows that should supersede previously ingested `NormalizedActivity` entries, rather than creating parallel duplicates.

**Why this was a deliberate architectural choice:** Re-import policy is a business rule, not a technical one. The options — (a) version batches and let analysts manually unlink old rows, (b) auto-supersede on matching `source_reference_id`, (c) reject duplicate document numbers entirely — each carry different audit implications. Building any of these without an explicit PM decision would bake in the wrong assumption. The current prototype creates a new `ImportBatch` per upload and leaves prior records intact: the conservative, auditor-safe default.

**The architectural consequence:** `NormalizedActivity` has a `source_reference_id` field that supports future supersession matching. Adding a `superseded_by` FK pointing to the replacement row — and a batch-level "supersede previous" flag — requires no schema migration beyond adding two nullable fields.

**What we'd ask the PM:** "If SAP sends a corrected file for Q1, should analysts see both the original and the correction side-by-side, or should the old row be automatically withdrawn? Can a locked row ever be superseded?"

---

## 3. Versioned emission factor snapshots pinned at lock time

**What we skipped:** Attaching the specific emission factor set used to compute `estimated_emissions_kgco2e` to each `NormalizedActivity` at the moment it is locked, so auditors can reproduce the calculation years later even after factors are updated.

**Why this was a deliberate architectural choice:** Factor versioning is an audit requirement, not a normalization requirement. The assignment explicitly states the hard problem is ingestion and data quality. We expose `estimated_emissions_kgco2e` using static DEFRA-aligned placeholder factors — clearly labelled as non-audit-grade in both `MODEL.md` and the UI — so analysts see a complete row. The schema is designed so that adding `factor_set_id` as a FK on `NormalizedActivity` requires no structural migration.

**The risk we are accepting:** If this prototype were used for actual regulatory reporting, the static factors would be indefensible to auditors. We flagged this explicitly. The correct fix is a `FactorSet` table — not more normalization logic.

**What we'd build next:** A `FactorSet` table versioned by reporting year and methodology (DEFRA, EPA, GHG Protocol), with an immutable snapshot FK written to `NormalizedActivity` at lock time, so the calculation is always reproducible from first principles.
