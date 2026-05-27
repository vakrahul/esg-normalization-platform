import math
from datetime import datetime

from apps.normalization.models import NormalizedActivity
from apps.normalization.reference import (
    AIRPORT_COORDS,
    ELECTRICITY_KGCO2E_PER_KWH,
    FLIGHT_KGCO2E_PER_KM,
    FUEL_KGCO2E_PER_USD,
    HOTEL_KGCO2E_PER_NIGHT,
    RIDE_KGCO2E_PER_MILE,
)


def _haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def estimate_emissions(activity: NormalizedActivity) -> float | None:
    meta = activity.metadata or {}

    if activity.activity_type == NormalizedActivity.ACTIVITY_ELECTRICITY:
        if activity.quantity is not None:
            return round(activity.quantity * ELECTRICITY_KGCO2E_PER_KWH, 4)

    if activity.activity_type == NormalizedActivity.ACTIVITY_FUEL:
        if activity.spend_amount is not None and activity.spend_amount > 0:
            return round(activity.spend_amount * FUEL_KGCO2E_PER_USD, 4)

    if activity.activity_type == NormalizedActivity.ACTIVITY_FLIGHT:
        start = meta.get("start_city_code")
        end = meta.get("end_city_code")
        if start in AIRPORT_COORDS and end in AIRPORT_COORDS:
            c1, c2 = AIRPORT_COORDS[start], AIRPORT_COORDS[end]
            km = _haversine_km(c1[0], c1[1], c2[0], c2[1])
            return round(km * FLIGHT_KGCO2E_PER_KM, 4)
        lbs = meta.get("carbon_emission_lbs")
        if lbs is not None:
            return round(float(lbs) * 0.453592, 4)

    if activity.activity_type == NormalizedActivity.ACTIVITY_HOTEL:
        start = meta.get("start_date_local")
        end = meta.get("end_date_local")
        if start and end:
            try:
                d0 = datetime.strptime(start[:10], "%Y-%m-%d").date()
                d1 = datetime.strptime(end[:10], "%Y-%m-%d").date()
                nights = max((d1 - d0).days, 1)
                return round(nights * HOTEL_KGCO2E_PER_NIGHT, 4)
            except ValueError:
                pass

    if activity.activity_type == NormalizedActivity.ACTIVITY_GROUND:
        miles = meta.get("miles")
        if miles is not None:
            return round(float(miles) * RIDE_KGCO2E_PER_MILE, 4)

    return None
