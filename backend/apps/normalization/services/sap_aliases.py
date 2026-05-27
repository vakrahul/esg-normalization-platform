"""Map common SAP export header variants (incl. German) to canonical English keys."""

SAP_COLUMN_ALIASES = {
    "Geschäftsjahr": "FiscalYear",
    "Geschaeftsjahr": "FiscalYear",
    "Buchungsperiode": "AccountingPeriod",
    "Buchungskreis": "Accounting_Company",
    "Kostenstelle": "Accounting_CostCenter",
    "Währung": "Currency",
    "Waehrung": "Currency",
    "Buchungsdatum": "TransactionDate",
    "Belegart": "TransactionType",
    "Belegnummer": "DocumentNumber",
    "Anforderer": "Requester",
    "Positionstext": "LineText",
    "Herkunftssystem": "OriginatingSystem",
    "Betrag": "TransactionAmount",
}


def normalize_sap_payload(payload: dict) -> dict:
    if not payload:
        return payload
    out = dict(payload)
    for key, value in list(payload.items()):
        canonical = SAP_COLUMN_ALIASES.get(key.strip())
        if canonical and canonical not in out:
            out[canonical] = value
    return out
