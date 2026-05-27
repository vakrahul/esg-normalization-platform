from apps.core.models import DataSource
from apps.normalization.models import NormalizedActivity, ValidationIssue
from apps.normalization.reference import HIGH_USAGE_KWH_THRESHOLD, KNOWN_AIRPORTS, KNOWN_COST_CENTERS


def _upsert_issue(activity, severity, issue_type, message):
    ValidationIssue.objects.update_or_create(
        activity=activity,
        issue_type=issue_type,
        defaults={"severity": severity, "message": message, "resolved": False},
    )


def _clear_resolved_types(activity, active_types):
    activity.validation_issues.exclude(issue_type__in=active_types).update(resolved=True)


def validate_activity(activity: NormalizedActivity) -> list[str]:
    active_types = []
    payload = activity.raw_record.raw_payload
    meta = activity.metadata or {}

    if activity.source_type == DataSource.SOURCE_SAP:
        if not activity.currency:
            _upsert_issue(activity, ValidationIssue.SEVERITY_HIGH, "missing_currency", "Currency is missing.")
            active_types.append("missing_currency")
        if activity.activity_date is None:
            _upsert_issue(activity, ValidationIssue.SEVERITY_HIGH, "malformed_date", "Transaction date could not be parsed.")
            active_types.append("malformed_date")
        if activity.spend_amount is not None and activity.spend_amount < 0:
            _upsert_issue(activity, ValidationIssue.SEVERITY_HIGH, "negative_value", "Transaction amount is negative.")
            active_types.append("negative_value")
        cc = meta.get("cost_center") or payload.get("Accounting_CostCenter")
        if cc and cc not in KNOWN_COST_CENTERS:
            _upsert_issue(activity, ValidationIssue.SEVERITY_MEDIUM, "unknown_cost_center", f"Unknown cost center: {cc}.")
            active_types.append("unknown_cost_center")

    if activity.source_type == DataSource.SOURCE_UTILITY:
        if activity.quantity is None:
            _upsert_issue(activity, ValidationIssue.SEVERITY_HIGH, "missing_usage", "Usage value is missing.")
            active_types.append("missing_usage")
        elif activity.quantity > HIGH_USAGE_KWH_THRESHOLD:
            _upsert_issue(
                activity,
                ValidationIssue.SEVERITY_MEDIUM,
                "suspicious_usage",
                f"Usage {activity.quantity} kWh exceeds threshold.",
            )
            active_types.append("suspicious_usage")
        notes = (payload.get("notes") or "").lower()
        if "estimated" in notes:
            _upsert_issue(activity, ValidationIssue.SEVERITY_LOW, "estimated_reading", "Billing period marked as estimated.")
            active_types.append("estimated_reading")
        _check_utility_overlap(activity, active_types)

    if activity.source_type == DataSource.SOURCE_TRAVEL:
        if activity.activity_type == NormalizedActivity.ACTIVITY_FLIGHT:
            start = meta.get("start_city_code")
            end = meta.get("end_city_code")
            if start and start not in KNOWN_AIRPORTS:
                _upsert_issue(activity, ValidationIssue.SEVERITY_MEDIUM, "unknown_airport", f"Unknown airport: {start}.")
                active_types.append("unknown_airport")
            if end and end not in KNOWN_AIRPORTS:
                _upsert_issue(activity, ValidationIssue.SEVERITY_MEDIUM, "unknown_airport", f"Unknown airport: {end}.")
                active_types.append("unknown_airport")
            if activity.estimated_emissions_kgco2e is None:
                _upsert_issue(activity, ValidationIssue.SEVERITY_LOW, "missing_emissions", "Emissions estimate unavailable.")
                active_types.append("missing_emissions")
        if activity.activity_type == NormalizedActivity.ACTIVITY_GROUND:
            if meta.get("miles") is None:
                _upsert_issue(activity, ValidationIssue.SEVERITY_MEDIUM, "missing_miles", "Distance in miles is missing.")
                active_types.append("missing_miles")
        if activity.activity_date is None:
            _upsert_issue(activity, ValidationIssue.SEVERITY_HIGH, "malformed_date", "Travel date could not be parsed.")
            active_types.append("malformed_date")
        if not activity.source_reference_id:
            _upsert_issue(activity, ValidationIssue.SEVERITY_MEDIUM, "incomplete_data", "Trip reference is missing.")
            active_types.append("incomplete_data")

    _clear_resolved_types(activity, active_types)
    return active_types


def _check_utility_overlap(activity, active_types):
    meta = activity.metadata or {}
    start = meta.get("billing_start")
    end = meta.get("billing_end")
    meter = meta.get("meter_id")
    if not start or not end or not meter:
        return
    from datetime import datetime

    try:
        s0 = datetime.strptime(start[:10], "%Y-%m-%d").date()
        e0 = datetime.strptime(end[:10], "%Y-%m-%d").date()
    except ValueError:
        return

    others = NormalizedActivity.objects.filter(
        source_type=DataSource.SOURCE_UTILITY,
        metadata__meter_id=meter,
    ).exclude(pk=activity.pk)

    for other in others:
        om = other.metadata or {}
        if not om.get("billing_start") or not om.get("billing_end"):
            continue
        try:
            s1 = datetime.strptime(om["billing_start"][:10], "%Y-%m-%d").date()
            e1 = datetime.strptime(om["billing_end"][:10], "%Y-%m-%d").date()
        except ValueError:
            continue
        if s0 <= e1 and s1 <= e0:
            _upsert_issue(
                activity,
                ValidationIssue.SEVERITY_MEDIUM,
                "overlapping_period",
                f"Billing period overlaps with activity {other.pk} for meter {meter}.",
            )
            active_types.append("overlapping_period")
            break


def apply_review_status_from_issues(activity: NormalizedActivity):
    issues = activity.validation_issues.filter(resolved=False)
    if issues.filter(severity=ValidationIssue.SEVERITY_HIGH).exists():
        activity.review_status = NormalizedActivity.REVIEW_FLAGGED
    elif issues.exists():
        if activity.review_status not in (
            NormalizedActivity.REVIEW_APPROVED,
            NormalizedActivity.REVIEW_REJECTED,
        ):
            activity.review_status = NormalizedActivity.REVIEW_PENDING
    activity.save(update_fields=["review_status", "updated_at"])
