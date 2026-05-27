# Data source research

This document explains what we researched for each ingestion source, what the sample data represents, and what would break in production.

## 1. SAP — fuel and procurement

### What we researched

- SAP Ariba / procurement administration exports and budget transaction flat files.
- Public reference: [SAP Procurement Admin Guide (PDF)](https://help.sap.com/doc/6c6aa6afc1da10149a5eec27ae2c573b/2605/en-US/ProcurementAdmin.pdf)

### What real exports look like

Enterprise SAP landscapes rarely expose a single clean API to sustainability teams. More often we see:

- Flat CSV/Excel extracts from Ariba, S/4HANA reporting, or finance-owned budget exports.
- Accounting-oriented column names (`Accounting_CostCenter`, `FiscalYear`, `DocumentNumber`).
- Mixed transaction types on one file (fuel, services, capex).
- Inconsistent dates (`2026-01-12` vs `2026/01/18`) and occasional missing currency.
- Localized or client-specific column variants; plant/cost-center codes that require a master-data lookup.

We did **not** implement IDoc, OData, or BAPI ingestion. Those are integration-team interfaces. Sustainability ops typically work from scheduled finance extracts; CSV upload matches that operational reality for a prototype.

### What we chose to handle

| Handled | Ignored (prototype) |
|---------|---------------------|
| CSV upload mimicking BudgetTransaction-style columns | IDoc / RFC / OData live sync |
| Fuel vs procurement classification via `TransactionType` | Multi-language header mapping |
| Scope 1 (fuel) vs Scope 3 (other procurement) | Plant master-data service |
| Date multi-format parsing | Currency conversion / FX |
| Cost-center validation against a small reference set | SAP authorization and tenant routing |

### Sample data (`samples/sap_budget_export.csv`)

Rows intentionally include:

- Valid fuel and procurement lines with known cost centers (`CC100`, `CC200`).
- Missing currency on one fuel line.
- Negative amount (credit or error).
- Unknown cost center (`UNK001`).
- Alternate date format (`2026/01/18`).

These exercise validation rules an analyst would need before audit lock.

### What breaks in production

- Files with hundreds of column variants per client; requires configurable column mapping templates.
- Encrypted or SFTP-delivered files; needs a secure ingestion worker, not synchronous HTTP upload.
- Duplicate `DocumentNumber` across fiscal years without composite keys.
- German or mixed-language headers without a mapping layer (prototype includes `sap_export_de_variant.csv` + alias map in `sap_aliases.py`).

---

## 2. Utility — electricity

### What we researched

- Oracle Utilities Green Button / “Download My Data” style exports used by facilities teams.
- Public reference: [Oracle Green Button — Download My Data](https://docs.oracle.com/en/industries/utilities/digital-self-service/energy-management-overview/green-button-downloadmydata.html#GUID-51913E15-170B-4856-A8F8-4C74A8321134)

### What real exports look like

Utility data is billing-period-centric, not calendar-month-centric:

- Account and meter identifiers.
- `billing_start` / `billing_end` that do not align to fiscal months.
- Usage in kWh (sometimes missing when AMI read failed).
- Notes indicating estimated reads.
- Occasional absurd usage values (data entry or unit errors).

We chose **portal CSV export**, not PDF OCR. PDF bills are common in the field, but parsing them requires OCR, layout models, and utility-specific templates. CSV matches Green Button–style structured exports and keeps the pipeline testable.

### What we chose to handle

| Handled | Ignored (prototype) |
|---------|---------------------|
| CSV with account, meter, billing window, usage, cost | PDF bill ingestion |
| Scope 2 electricity classification | Tariff breakdown / demand charges |
| kWh as normalized unit | Net metering / on-site generation splits |
| Overlapping billing period detection per meter | Real-time AMI streaming |
| High-usage and missing-usage validation | Regional emissions factors |

### Sample data (`samples/utility_billing.csv`)

Rows include:

- Normal billing period with usage.
- Very high usage (999,999 kWh) for suspicious-usage rule.
- Empty usage with cost still present (missing AMI read).

### What breaks in production

- Dozens of utility CSV schemas; needs per-utility adapters.
- PDF-only utilities; requires OCR pipeline and human QA.
- Multiple meters per site rolled up incorrectly.
- Timezone boundaries on billing periods.

---

## 3. Corporate travel — flights, hotels, ground transport

### What we researched

- SAP Concur itinerary API structure (air, hotel, ground).
- Public reference: [Concur Itinerary API (markdown)](https://github.com/concur/developer.concur.com/blob/preview/src/api-reference/travel/itinerary/itinerary.markdown)

### What real exports look like

Travel platforms expose itinerary objects with:

- `trip_id` / booking references.
- Segment types: air, hotel, car/ride.
- Airport codes for flights; not always distance or emissions.
- Hotel stay date ranges in local time.
- Ground transport with missing distance.

Production ingestion is usually **API pull with OAuth**, not files dropped by analysts.

### What we chose to handle

| Handled | Ignored (prototype) |
|---------|---------------------|
| JSON itinerary array (fixture simulating API pull) | Live Concur OAuth and pagination |
| flight / hotel / ride → Scope 3 activity types | Car rental fuel splits |
| Airport code validation (IATA subset) | Class-of-service emissions methodology |
| Missing miles / emissions flags | Policy compliance (out-of-policy trips) |

### Sample data (`backend/fixtures/mock_travel_response.json`)

Three bookings mirror Concur-style variety:

- Air: HYD–DXB, null `carbon_emission_lbs`.
- Hotel: local dates, `total_rate`.
- Ride: null `miles`, duration only.

### Ingestion mechanism

`POST /api/imports/travel-sync/` reads the fixture from disk. The endpoint name reflects the production pattern (scheduled API sync). The fixture keeps demos deterministic without managing Concur app credentials.

### What breaks in production

- OAuth token refresh and rate limits.
- Partial itineraries updated across multiple API calls.
- Non-IATA location codes.
- Multi-currency reimbursement vs booking currency.

---

## Sample data philosophy

We fabricated data **after** researching field shapes, not before. Every intentional anomaly maps to a validation rule or analyst workflow step documented in `MODEL.md` and visible in the review UI.
