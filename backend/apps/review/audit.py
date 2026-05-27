from apps.review.models import AuditLog


def log_activity_action(activity, action, user=None, old_value=None, new_value=None):
    return AuditLog.objects.create(
        activity=activity,
        action=action,
        changed_by=user,
        old_value=old_value,
        new_value=new_value,
    )
