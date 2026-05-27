from rest_framework import serializers

from apps.ingestion.models import ImportBatch, RawRecord


class ImportBatchSerializer(serializers.ModelSerializer):
    source_type = serializers.CharField(source="datasource.source_type", read_only=True)

    class Meta:
        model = ImportBatch
        fields = [
            "id",
            "source_type",
            "original_filename",
            "status",
            "row_count",
            "success_count",
            "flagged_count",
            "failed_count",
            "imported_at",
        ]


class ImportBatchDetailSerializer(ImportBatchSerializer):
    issue_count = serializers.SerializerMethodField()
    failure_summary = serializers.SerializerMethodField()

    class Meta(ImportBatchSerializer.Meta):
        fields = ImportBatchSerializer.Meta.fields + ["issue_count", "failure_summary"]

    def get_issue_count(self, obj):
        from apps.normalization.models import NormalizedActivity

        return (
            NormalizedActivity.objects.filter(
                raw_record__import_batch=obj,
                validation_issues__resolved=False,
            )
            .distinct()
            .count()
        )

    def get_failure_summary(self, obj):
        failed = RawRecord.objects.filter(
            import_batch=obj,
            processing_status=RawRecord.STATUS_FAILED,
        ).order_by("row_number")[:20]
        return [
            {"row_number": r.row_number, "error": r.processing_error or "Unknown error"}
            for r in failed
        ]
