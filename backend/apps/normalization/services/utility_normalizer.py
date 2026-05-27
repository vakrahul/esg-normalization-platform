from apps.core.models import DataSource
from apps.normalization.models import NormalizedActivity
from apps.normalization.services.base import BaseNormalizer
from apps.normalization.services.date_utils import parse_date


class UtilityNormalizer(BaseNormalizer):
    source_type = DataSource.SOURCE_UTILITY

    def _build_activity_fields(self, raw_record) -> dict:
        p = raw_record.raw_payload
        usage_raw = p.get("usage")
        quantity = None
        if usage_raw not in (None, ""):
            try:
                quantity = float(usage_raw)
            except (TypeError, ValueError):
                quantity = None

        cost_raw = p.get("cost")
        spend_amount = None
        if cost_raw not in (None, ""):
            try:
                spend_amount = float(cost_raw)
            except (TypeError, ValueError):
                spend_amount = None

        billing_start = p.get("billing_start")
        billing_end = p.get("billing_end")
        activity_date = parse_date(billing_end) or parse_date(billing_start)

        return {
            "activity_type": NormalizedActivity.ACTIVITY_ELECTRICITY,
            "scope": NormalizedActivity.SCOPE_2,
            "activity_date": activity_date,
            "quantity": quantity,
            "unit": (p.get("units") or "kWh").strip(),
            "normalized_unit": "kWh",
            "spend_amount": spend_amount,
            "currency": "USD",
            "facility": (p.get("account_number") or "").strip(),
            "vendor": (p.get("service_type") or "electricity").strip(),
            "source_reference_id": (p.get("account_number") or "").strip() or None,
            "metadata": {
                "account_number": p.get("account_number"),
                "meter_id": p.get("meter_id"),
                "billing_start": billing_start,
                "billing_end": billing_end,
                "service_type": p.get("service_type"),
                "notes": p.get("notes"),
            },
        }
