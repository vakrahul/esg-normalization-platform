# Deliberate tradeoffs

The assignment asked for three things we **chose not to build** and why. These are intentional scope cuts, not oversights.

## 1. PDF utility bill ingestion (OCR)

**What we skipped:** Parsing electricity PDFs from utility portals.

**Why:** Real facilities teams do receive PDFs, but reliable extraction requires OCR, utility-specific layouts, and human-in-the-loop QA. That is a separate product surface from normalization and analyst review. We chose structured CSV ingestion aligned with Green Button / Download My Data exports so we could demonstrate validation logic (missing usage, estimated reads, overlapping billing periods) on clean structured fields.

**What we would build next:** A document-ingestion worker that outputs the same `RawRecord` JSON shape as CSV, so downstream normalization stays unchanged.

---

## 2. Live enterprise integrations (SAP OData, Concur OAuth)

**What we skipped:** Real-time or scheduled pulls from SAP OData/BAPI and Concur itinerary APIs with OAuth, retries, and idempotency keys.

**Why:** Integration credentials, sandbox contracts, and error handling dominate calendar time without adding new insight to the **data model** or **analyst workflow**, which is what this prototype evaluates. File upload (SAP, utility) and a fixture-backed travel sync prove the pipeline end-to-end while keeping the repo runnable by reviewers in minutes.

**What we would build next:** Connector apps per source that only create `ImportBatch` + `RawRecord` rows; normalization and review code stay shared.

---

## 3. Emissions factor engine and methodology versioning

**What we skipped:** A governed library of emission factors (region, year, gas, DEFRA/IPCC references), uncertainty ranges, and audit of factor versions used per activity.

**Why:** Breathe’s assignment states the hard problem is ingestion and data quality, not carbon math. We expose `estimated_emissions_kgco2e` using static placeholder factors so analysts see a complete row, but we do not pretend those numbers are audit-ready.

**What we would build next:** Factor tables versioned by reporting year, attached to `NormalizedActivity` via `factor_set_id`, with immutable factor snapshots when a record is locked.
