from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.normalization.models import NormalizedActivity


def ensure_not_locked(activity: NormalizedActivity):
    if activity.locked_for_audit:
        raise PermissionDenied("This activity is locked for audit and cannot be modified.")


def ensure_can_lock(activity: NormalizedActivity):
    if activity.review_status != NormalizedActivity.REVIEW_APPROVED:
        raise ValidationError("Only approved activities can be locked for audit.")
