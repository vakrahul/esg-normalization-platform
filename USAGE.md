# How to run and use Breathe ESG

## Quick start (Windows CMD)

### Terminal 1 — Backend

```cmd
cd C:\Users\RAHUL\project\backend
pip install -r requirements.txt
set USE_SQLITE=true
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

Keep this window open. Backend runs at http://127.0.0.1:8000

### Terminal 2 — Frontend

```cmd
cd C:\Users\RAHUL\project\frontend
npm install
npm run dev
```

Open http://localhost:5173

**Login:** `analyst` / `analyst123`

---

## Use case walkthrough

### 1. Ingest data (Upload page)

| Source | What to do | Sample files in `/samples` |
|--------|------------|----------------------------|
| SAP | Choose any `.csv` with SAP-style columns | `sap_budget_export.csv`, `sap_procurement_q2.csv`, `sap_fuel_india.csv` |
| Utility | Choose any `.csv` with utility columns | `utility_billing.csv`, `utility_campus_north.csv`, `utility_campus_south.csv` |
| Travel | Upload `.json` array OR click Sync buttons | `travel_domestic_trips.json`, `travel_international_trips.json` |

**Yes — you can upload your own CSV** as long as headers match the samples:

**SAP required columns:**  
`FiscalYear`, `AccountingPeriod`, `Accounting_Company`, `Accounting_CostCenter`, `Currency`, `TransactionDate`, `TransactionType`, `DocumentNumber`, `Requester`, `LineText`, `OriginatingSystem`, `TransactionAmount`

**Utility required columns:**  
`account_number`, `meter_id`, `service_type`, `billing_start`, `billing_end`, `usage`, `units`, `cost`, `notes`

**Travel:** JSON array of objects like Concur itinerary (see sample files).

Each upload creates a **new import batch**. Old raw data is never changed.

### 2. Review (Review dashboard)

- Summary banner shows totals: flagged, approved, locked, etc.
- Filter by status, source, scope, severity.
- Click **Review** on a row to open detail.

### 3. Activity detail

- **Validation issues** table — what is wrong and how severe.
- **Approve / Reject / Lock** with analyst comment.
- **Timeline** — imported → normalized → flagged → approved → locked.
- Raw JSON is read-only (audit lineage).

### 4. Typical analyst story

1. Facilities uploads `utility_campus_north.csv` → some rows flagged (high usage, estimated bill).
2. Finance uploads `sap_fuel_india.csv` → missing currency row flagged.
3. HR syncs travel domestic dataset → missing miles on ride flagged.
4. Analyst opens each flagged activity, adds comment, approves valid rows, locks after approval.

---

## Extra sample files (for testing)

Upload these one at a time to see different validation outcomes:

| File | Expected highlights |
|------|---------------------|
| `sap_budget_export.csv` | Negative amount, unknown cost center, missing currency |
| `sap_procurement_q2.csv` | EUR procurement + unknown cost center |
| `sap_fuel_india.csv` | India fuel + missing currency row |
| `utility_billing.csv` | Missing usage, 999999 kWh, estimated note |
| `utility_campus_north.csv` | Overlap risk same meters |
| `utility_campus_south.csv` | Missing usage + very high kWh |
| Travel sync **default** | Original 3-trip fixture |
| Travel sync **domestic** | India domestic trips |
| Travel sync **international** | Long-haul + unknown airport risk |

---

## API (optional)

```cmd
pip install requests
python backend\scripts\sample_ingest.py
```

Travel sync with dataset:

```http
POST /api/imports/travel-sync/?dataset=domestic
POST /api/imports/travel-sync/?dataset=international
```

---

## Clear old / test data

Too many batches from testing?

- **In app:** Upload page → **Clear demo data** (removes all batches and review rows).
- **CLI:** `python manage.py reset_demo_data` (type `yes` to confirm).

Then upload fresh samples for a clean demo.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Vite `ECONNREFUSED` | Start backend first (`runserver` on port 8000) |
| `No module named whitenoise` | `pip install -r requirements.txt` |
| `seed_data` error | Run `python manage.py seed_data` again after latest code pull |
| Login fails | Run `python manage.py seed_data` to reset analyst user |
