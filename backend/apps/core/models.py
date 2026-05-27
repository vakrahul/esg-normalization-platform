from django.db import models


class Organization(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class DataSource(models.Model):
    SOURCE_SAP = "sap"
    SOURCE_UTILITY = "utility"
    SOURCE_TRAVEL = "travel"
    SOURCE_CHOICES = [
        (SOURCE_SAP, "SAP"),
        (SOURCE_UTILITY, "Utility"),
        (SOURCE_TRAVEL, "Travel"),
    ]

    METHOD_CSV = "csv"
    METHOD_API = "api"
    METHOD_CHOICES = [
        (METHOD_CSV, "CSV"),
        (METHOD_API, "API"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="data_sources"
    )
    source_type = models.CharField(max_length=32, choices=SOURCE_CHOICES)
    ingestion_method = models.CharField(max_length=16, choices=METHOD_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["organization", "source_type"]]
        ordering = ["source_type"]

    def __str__(self):
        return f"{self.organization.name} — {self.source_type}"
