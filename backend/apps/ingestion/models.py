from django.db import models

from apps.core.models import DataSource


class ImportBatch(models.Model):
    STATUS_PROCESSING = "processing"
    STATUS_COMPLETED = "completed"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = [
        (STATUS_PROCESSING, "Processing"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_FAILED, "Failed"),
    ]

    datasource = models.ForeignKey(
        DataSource, on_delete=models.CASCADE, related_name="import_batches"
    )
    original_filename = models.CharField(max_length=512, blank=True, default="")
    status = models.CharField(
        max_length=32, choices=STATUS_CHOICES, default=STATUS_PROCESSING
    )
    row_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    success_count = models.PositiveIntegerField(default=0)
    flagged_count = models.PositiveIntegerField(default=0)
    imported_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-imported_at"]

    def __str__(self):
        return f"Batch {self.pk} ({self.datasource.source_type})"


class RawRecord(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PROCESSED = "processed"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PROCESSED, "Processed"),
        (STATUS_FAILED, "Failed"),
    ]

    import_batch = models.ForeignKey(
        ImportBatch, on_delete=models.CASCADE, related_name="raw_records"
    )
    row_number = models.PositiveIntegerField()
    raw_payload = models.JSONField()
    processing_status = models.CharField(
        max_length=32, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    processing_error = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["row_number"]
        unique_together = [["import_batch", "row_number"]]

    def __str__(self):
        return f"Raw {self.import_batch_id}:{self.row_number}"
