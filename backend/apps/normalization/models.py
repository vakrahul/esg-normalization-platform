from django.db import models

from apps.core.models import Organization
from apps.ingestion.models import RawRecord


class NormalizedActivity(models.Model):
    ACTIVITY_FUEL = "fuel"
    ACTIVITY_ELECTRICITY = "electricity"
    ACTIVITY_PROCUREMENT = "procurement"
    ACTIVITY_FLIGHT = "flight"
    ACTIVITY_HOTEL = "hotel"
    ACTIVITY_GROUND = "ground_transport"
    ACTIVITY_CHOICES = [
        (ACTIVITY_FUEL, "Fuel"),
        (ACTIVITY_ELECTRICITY, "Electricity"),
        (ACTIVITY_PROCUREMENT, "Procurement"),
        (ACTIVITY_FLIGHT, "Flight"),
        (ACTIVITY_HOTEL, "Hotel"),
        (ACTIVITY_GROUND, "Ground transport"),
    ]

    SCOPE_1 = "scope_1"
    SCOPE_2 = "scope_2"
    SCOPE_3 = "scope_3"
    SCOPE_CHOICES = [
        (SCOPE_1, "Scope 1"),
        (SCOPE_2, "Scope 2"),
        (SCOPE_3, "Scope 3"),
    ]

    REVIEW_PENDING = "pending"
    REVIEW_FLAGGED = "flagged"
    REVIEW_APPROVED = "approved"
    REVIEW_REJECTED = "rejected"
    REVIEW_CHOICES = [
        (REVIEW_PENDING, "Pending"),
        (REVIEW_FLAGGED, "Flagged"),
        (REVIEW_APPROVED, "Approved"),
        (REVIEW_REJECTED, "Rejected"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="activities"
    )
    raw_record = models.OneToOneField(
        RawRecord, on_delete=models.CASCADE, related_name="normalized_activity"
    )
    source_type = models.CharField(max_length=32)
    activity_type = models.CharField(max_length=32, choices=ACTIVITY_CHOICES)
    scope = models.CharField(max_length=16, choices=SCOPE_CHOICES)
    activity_date = models.DateField(null=True, blank=True)
    quantity = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=64, blank=True, default="")
    normalized_unit = models.CharField(max_length=64, blank=True, default="")
    spend_amount = models.FloatField(null=True, blank=True)
    currency = models.CharField(max_length=16, blank=True, default="")
    facility = models.CharField(max_length=255, blank=True, default="")
    vendor = models.CharField(max_length=255, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    estimated_emissions_kgco2e = models.FloatField(null=True, blank=True)
    source_reference_id = models.CharField(max_length=255, null=True, blank=True)
    review_status = models.CharField(
        max_length=16, choices=REVIEW_CHOICES, default=REVIEW_PENDING
    )
    review_comment = models.TextField(null=True, blank=True)
    locked_for_audit = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    locked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "normalized activities"

    def __str__(self):
        return f"{self.activity_type} ({self.source_reference_id or self.pk})"


class ValidationIssue(models.Model):
    SEVERITY_LOW = "low"
    SEVERITY_MEDIUM = "medium"
    SEVERITY_HIGH = "high"
    SEVERITY_CHOICES = [
        (SEVERITY_LOW, "Low"),
        (SEVERITY_MEDIUM, "Medium"),
        (SEVERITY_HIGH, "High"),
    ]

    activity = models.ForeignKey(
        NormalizedActivity, on_delete=models.CASCADE, related_name="validation_issues"
    )
    severity = models.CharField(max_length=16, choices=SEVERITY_CHOICES)
    issue_type = models.CharField(max_length=64)
    message = models.TextField()
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-severity", "-created_at"]
        unique_together = [["activity", "issue_type"]]

    def __str__(self):
        return f"{self.issue_type} ({self.severity})"
