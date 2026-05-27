from apps.core.models import DataSource
from apps.normalization.models import NormalizedActivity
from apps.normalization.services.base import BaseNormalizer
from apps.normalization.services.date_utils import parse_date


class TravelNormalizer(BaseNormalizer):
    source_type = DataSource.SOURCE_TRAVEL

    def _build_activity_fields(self, raw_record) -> dict:
        p = raw_record.raw_payload
        booking = (p.get("booking_type") or "").lower()

        if booking == "air":
            activity_type = NormalizedActivity.ACTIVITY_FLIGHT
            activity_date = parse_date(p.get("start_date_utc"))
            vendor = (p.get("vendor") or "").strip()
            facility = f"{p.get('start_city_code', '')}-{p.get('end_city_code', '')}"
            metadata = {
                "trip_id": p.get("trip_id"),
                "booking_type": booking,
                "employee_id": p.get("employee_id"),
                "start_city_code": p.get("start_city_code"),
                "end_city_code": p.get("end_city_code"),
                "cabin": p.get("cabin"),
                "carbon_emission_lbs": p.get("carbon_emission_lbs"),
            }
        elif booking == "hotel":
            activity_type = NormalizedActivity.ACTIVITY_HOTEL
            activity_date = parse_date(p.get("start_date_local"))
            vendor = (p.get("vendor_name") or "").strip()
            facility = vendor
            metadata = {
                "trip_id": p.get("trip_id"),
                "booking_type": booking,
                "employee_id": p.get("employee_id"),
                "start_date_local": p.get("start_date_local"),
                "end_date_local": p.get("end_date_local"),
                "total_rate": p.get("total_rate"),
            }
        else:
            activity_type = NormalizedActivity.ACTIVITY_GROUND
            activity_date = None
            vendor = (p.get("vendor_name") or "").strip()
            facility = vendor
            metadata = {
                "trip_id": p.get("trip_id"),
                "booking_type": booking,
                "employee_id": p.get("employee_id"),
                "miles": p.get("miles"),
                "duration": p.get("duration"),
            }

        spend_amount = None
        if p.get("total_rate") is not None:
            try:
                spend_amount = float(p.get("total_rate"))
            except (TypeError, ValueError):
                pass

        return {
            "activity_type": activity_type,
            "scope": NormalizedActivity.SCOPE_3,
            "activity_date": activity_date,
            "quantity": None,
            "unit": "",
            "normalized_unit": "",
            "spend_amount": spend_amount,
            "currency": "USD",
            "facility": facility[:255],
            "vendor": vendor[:255],
            "source_reference_id": (p.get("trip_id") or "").strip() or None,
            "metadata": metadata,
        }
