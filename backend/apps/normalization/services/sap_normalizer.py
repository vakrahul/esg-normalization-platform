from apps.core.models import DataSource
from apps.normalization.models import NormalizedActivity
from apps.normalization.services.base import BaseNormalizer
from apps.normalization.services.date_utils import parse_date
from apps.normalization.services.sap_aliases import normalize_sap_payload


class SAPNormalizer(BaseNormalizer):
    source_type = DataSource.SOURCE_SAP

    def _build_activity_fields(self, raw_record) -> dict:
        p = normalize_sap_payload(raw_record.raw_payload)
        tx_type = (p.get("TransactionType") or "").lower()
        fuel_tokens = ("fuel", "kraftstoff", "diesel", "gasoline", "benzin", "heizöl", "heizoel")
        is_fuel = any(token in tx_type for token in fuel_tokens)

        amount_raw = p.get("TransactionAmount")
        spend_amount = None
        if amount_raw not in (None, ""):
            try:
                spend_amount = float(amount_raw)
            except (TypeError, ValueError):
                spend_amount = None

        return {
            "activity_type": (
                NormalizedActivity.ACTIVITY_FUEL if is_fuel else NormalizedActivity.ACTIVITY_PROCUREMENT
            ),
            "scope": (
                NormalizedActivity.SCOPE_1 if is_fuel else NormalizedActivity.SCOPE_3
            ),
            "activity_date": parse_date(p.get("TransactionDate")),
            "quantity": None,
            "unit": "",
            "normalized_unit": "",
            "spend_amount": spend_amount,
            "currency": (p.get("Currency") or "").strip(),
            "facility": (p.get("Accounting_Company") or "").strip(),
            "vendor": (p.get("Requester") or p.get("LineText") or "").strip()[:255],
            "source_reference_id": (p.get("DocumentNumber") or "").strip() or None,
            "metadata": {
                "document_number": p.get("DocumentNumber"),
                "fiscal_year": p.get("FiscalYear"),
                "accounting_period": p.get("AccountingPeriod"),
                "cost_center": p.get("Accounting_CostCenter"),
                "line_text": p.get("LineText"),
                "transaction_type": p.get("TransactionType"),
                "originating_system": p.get("OriginatingSystem"),
            },
        }
