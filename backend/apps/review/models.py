from django.conf import settings
from django.db import models

from apps.normalization.models import NormalizedActivity


class AuditLog(models.Model):
    ACTION_CREATED = "created"
    ACTION_NORMALIZED = "normalized"
    ACTION_EDITED = "edited"
    ACTION_APPROVED = "approved"
    ACTION_REJECTED = "rejected"
    ACTION_LOCKED = "locked"
    ACTION_CHOICES = [
        (ACTION_CREATED, "Created"),
        (ACTION_NORMALIZED, "Normalized"),
        (ACTION_EDITED, "Edited"),
        (ACTION_APPROVED, "Approved"),
        (ACTION_REJECTED, "Rejected"),
        (ACTION_LOCKED, "Locked"),
    ]

    activity = models.ForeignKey(
        NormalizedActivity, on_delete=models.CASCADE, related_name="audit_logs"
    )
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["changed_at"]

    def __str__(self):
        return f"{self.action} on activity {self.activity_id}"
