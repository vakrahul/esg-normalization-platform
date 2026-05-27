# Submission checklist

Use this when emailing Breathe ESG.

## Email body template

Subject: Breathe ESG Tech Intern Submission — [Your Name]

```
GitHub: https://github.com/YOUR_USERNAME/YOUR_REPO
Live app: https://YOUR-FRONTEND.onrender.com

Login:
  Username: analyst
  Password: analyst123

Docs: MODEL.md, DECISIONS.md, TRADEOFFS.md, SOURCES.md
Demo script: DEMO_SCRIPT.md (README has Mermaid flowcharts)

Quick demo path:
1. Sign in
2. Clear demo data if re-testing
3. Upload samples/sap_budget_export.csv and samples/utility_billing.csv
4. Travel sync → domestic
5. Review → flagged activity → approve → lock
6. Optional: sap_export_de_variant.csv (German SAP headers)
```

## Repository access

Invite these accounts with read access:

- saurav@breatheesg.com
- rahul@breatheesg.com
- shivang@breatheesg.com

## Pre-submit verification

- [ ] Cleared old demo data (`Clear demo data` on Upload or `reset_demo_data`)
- [ ] Live frontend URL loads
- [ ] Live API `/api/health/` returns `{"status":"ok"}`
- [ ] Login works on deployed URL (not only localhost)
- [ ] SAP + utility upload succeeds
- [ ] Travel sync succeeds
- [ ] Review dashboard shows flagged rows
- [ ] Approve + lock works on activity detail
- [ ] All five docs present in repo root

## Demo script (3 minutes)

Full presenter lines: **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)**

README includes Mermaid **architecture** and **analyst sequence** diagrams.
