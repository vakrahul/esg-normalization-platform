from django.db import transaction

from apps.ingestion.models import RawRecord
from apps.normalization.services import get_normalizer
from apps.normalization.validators import apply_review_status_from_issues, validate_activity
from apps.review.audit import log_activity_action
from apps.review.models import AuditLog


def process_raw_record(raw_record: RawRecord) -> bool:
    source_type = raw_record.import_batch.datasource.source_type
    try:
        with transaction.atomic():
            normalizer = get_normalizer(source_type)
            activity = normalizer.normalize(raw_record)
            validate_activity(activity)
            apply_review_status_from_issues(activity)
            raw_record.processing_status = RawRecord.STATUS_PROCESSED
            raw_record.processing_error = None
            raw_record.save(update_fields=["processing_status", "processing_error"])
            log_activity_action(
                activity,
                AuditLog.ACTION_CREATED,
                new_value={"source_reference_id": activity.source_reference_id},
            )
        return True
    except Exception as exc:
        raw_record.processing_status = RawRecord.STATUS_FAILED
        raw_record.processing_error = str(exc)
        raw_record.save(update_fields=["processing_status", "processing_error"])
        return False


def process_batch(batch) -> tuple[int, int, int]:
    success = 0
    failed = 0
    flagged = 0
    for raw in batch.raw_records.order_by("row_number"):
        ok = process_raw_record(raw)
        if ok:
            success += 1
            activity = raw.normalized_activity
            if activity.validation_issues.filter(resolved=False).exists():
                flagged += 1
        else:
            failed += 1
    batch.success_count = success
    batch.flagged_count = flagged
    batch.failed_count = failed
    batch.status = batch.STATUS_COMPLETED
    batch.save(update_fields=["success_count", "flagged_count", "failed_count", "status"])
    return success, failed, flagged
