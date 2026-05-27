# Architecture decisions

This document records major design choices for the Breathe ESG prototype and the reasoning behind them.

## 1. Monolith with Django apps instead of microservices

**Decision:** Single Django project split into `core`, `ingestion`, `normalization`, and `review` apps.

**Reason:** The assignment prioritizes explainable ingestion, normalization, and audit workflows over distributed infrastructure. A monolith keeps deployment, debugging, and code review straightforward.

**Tradeoff:** Horizontal scaling and independent deploys are not addressed.

## 2. Synchronous ingestion pipeline

**Decision:** CSV parsing and normalization run inline when an import endpoint is called. No Celery, Kafka, or background workers.

**Reason:** Batch sizes in the prototype are small. Synchronous processing makes behavior predictable and easy to demonstrate in interviews or demos.

**Tradeoff:** Large enterprise files would require a queue and worker pool in production.

## 3. Immutable raw layer

**Decision:** Every imported row is stored as a `RawRecord` with a JSON `raw_payload` that is never updated. Normalization failures set `processing_error` on the raw record instead of altering the payload.

**Reason:** Auditors and analysts need provable lineage to the exact source row. Corrections flow through review and new imports, not silent overwrites.

## 4. Canonical schema plus metadata JSONField

**Decision:** `NormalizedActivity` holds shared fields (scope, dates, quantities, spend). Source-specific fields (billing windows, meter IDs, airport codes, document numbers) live in `metadata`.

**Reason:** A single wide table for all ERP and utility columns would be unmaintainable. Dropping source-specific data would break audit defensibility.

## 5. Per-source normalizer classes

**Decision:** `normalization/services/` contains `SAPNormalizer`, `UtilityNormalizer`, and `TravelNormalizer` behind a small registry.

**Reason:** Avoids a large conditional block in one module. Each normalizer is testable and readable in isolation.

## 6. Static emission estimates

**Decision:** `estimated_emissions_kgco2e` is computed with fixed placeholder factors in `normalization/emissions.py` (e.g. kWh times a constant, flight distance from airport pairs).

**Reason:** ESG prototypes are more credible when emissions appear on activities, but a full factor library and methodology engine is out of scope.

**Tradeoff:** Values are illustrative only and must not be used for regulatory reporting.

## 7. Travel data from fixture file, not a mock HTTP API

**Decision:** `POST /api/imports/travel-sync/` reads `backend/fixtures/mock_travel_response.json` from disk.

**Reason:** Fewer moving parts than hosting a fake Concur API. Deterministic for tests and demos. The endpoint name still reflects an API-pull workflow enterprises use in production.

## 8. Session authentication for analysts

**Decision:** Django session auth with CSRF for the React SPA. Default user created via `seed_data` management command.

**Reason:** Meets the requirement for `AuditLog.changed_by` without building OAuth or RBAC. Basic authentication is also enabled for API tooling.

**Tradeoff:** No role-based permissions; any authenticated user can approve, reject, and lock.

## 9. Validation as database records, not only API errors

**Decision:** Rules in `normalization/validators.py` create `ValidationIssue` rows. High severity issues set `review_status` to `flagged`.

**Reason:** Analysts need a durable queue of data quality problems, not transient error responses during import.

## 10. Append-only audit log

**Decision:** `AuditLog` entries are created on normalize, create, approve, reject, and lock. Admin disallows deletion.

**Reason:** Supports audit review narrative: who changed what and when.

## 11. Lock as terminal state

**Decision:** Approved activities can be locked. Locked activities cannot be edited; approve and reject are blocked.

**Reason:** Mirrors enterprise controls before external audit. Lock timestamp is stored in `locked_at`.

## 12. Import batch summary counters

**Decision:** `ImportBatch` stores `row_count`, `success_count`, `flagged_count`, and `failed_count`.

**Reason:** Operations teams need batch-level health without scanning every raw record.

## 13. List API severity aggregation

**Decision:** `GET /api/activities/` annotates `issue_count` and `highest_severity` (high over medium over low) for open issues.

**Reason:** Review dashboard can prioritize work without N+1 queries per row on the client.

## 14. React SPA with Vite and TanStack libraries

**Decision:** Frontend uses React 18, Vite, TypeScript, Tailwind CSS, TanStack Query for API state, and TanStack Table for the review grid.

**Reason:** Matches project requirements. Keeps the UI focused on analyst workflows rather than a large component library.

## 15. PostgreSQL in Docker, SQLite for quick local runs

**Decision:** `docker-compose.yml` uses PostgreSQL 16. `USE_SQLITE=true` switches the backend to SQLite for developers without Docker.

**Reason:** Production-like persistence in containers; low friction for local backend-only work.

## 16. Reference data in code

**Decision:** Known cost centers and airport codes are defined in `normalization/reference.py` rather than a separate reference-data service.

**Reason:** Sufficient for prototype validation rules (`unknown_cost_center`, `unknown_airport`). A real deployment would load from a master data store.

## Source subset summary

| Source | Format chosen | Ingestion | Scope | Out of scope |
|--------|---------------|-----------|-------|--------------|
| SAP | Ariba-style CSV | File upload | Fuel → 1; procurement → 3 | IDoc, OData, BAPI, FX |
| Utility | Green Button–style CSV | File upload | Electricity → 2 | PDF/OCR, tariffs |
| Travel | Concur-style JSON | Fixture sync (API-shaped) | Air/hotel/ride → 3 | OAuth, live Concur |

Details: [SOURCES.md](SOURCES.md). Deliberate omissions: [TRADEOFFS.md](TRADEOFFS.md).

## Questions for the PM

1. **SAP interface:** Does this client export from Ariba, S/4 reporting, or a finance data lake? That determines whether we invest in CSV templates vs OData.
2. **Utility coverage:** What percentage of sites provide CSV vs PDF-only bills? If PDF-heavy, we need an OCR phase before normalization.
3. **Travel platform:** Concur, Navan, or other? OAuth sandbox access drives the connector schedule.
4. **Audit bar:** Are static emission estimates acceptable for the prototype review, or must factors be methodology-versioned before lock?
5. **Multi-entity:** One organization per deployment or many subsidiaries with separate approval chains?
6. **Re-import policy:** If SAP sends a corrected file, do we version batches, supersede rows, or manual unlink?

## Decisions explicitly deferred

See [TRADEOFFS.md](TRADEOFFS.md) for the three primary scope cuts. Additional deferrals:

- Multi-organization UI (schema supports `Organization`; API scopes to default tenant)
- Event streaming and real-time dashboards
- Fine-grained RBAC and approval hierarchies
