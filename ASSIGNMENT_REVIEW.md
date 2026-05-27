# Assignment self-review (submission-ready)

Target: **10/10 after deploy** — code and docs meet the brief; live URL is the remaining gate.

## Rubric checklist

| Area (weight) | Status | Evidence |
|---------------|--------|----------|
| Data model (35%) | Strong | MODEL.md — Organization tenancy, immutable RawRecord, scopes, AuditLog, lock rules |
| Decisions (25%) | Strong | DECISIONS.md + SOURCES.md — per-source subset justified |
| Realistic sources (20%) | Strong | Samples + German SAP alias file + validation issues |
| Analyst UX (10%) | Strong | Upload → batch stats → review → approve → lock; clear demo data |
| Tradeoffs (10%) | Strong | TRADEOFFS.md — PDF, live APIs, factor engine |

## Deliverables

- [x] Django + React app (3 sources, normalize, validate, review, lock)
- [x] MODEL.md, DECISIONS.md, TRADEOFFS.md, SOURCES.md
- [x] Sample data with research rationale
- [x] README flowcharts + [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
- [x] Multi-tenant model (`Organization` FK; single client in prototype)
- [x] German SAP header mapping (`sap_export_de_variant.csv`)
- [ ] **You:** Deploy + add live URLs to README + submission email
- [ ] **You:** GitHub invite saurav@, rahul@, shivang@breatheesg.com

## Pre-record demo

1. `python manage.py reset_demo_data --no-input` (or UI clear)
2. Upload `sap_budget_export.csv`, `utility_billing.csv`
3. Travel sync **domestic**
4. Review → approve → lock one flagged row
5. Optional: `sap_export_de_variant.csv` for German headers story

## Rating

| State | Score |
|-------|-------|
| Local only | 8.5/10 |
| Deployed + clean demo + you can defend docs | **9.5–10/10** |
