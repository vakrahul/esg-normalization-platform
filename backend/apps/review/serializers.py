from rest_framework import serializers

from apps.ingestion.models import RawRecord
from apps.normalization.models import NormalizedActivity, ValidationIssue
from apps.review.models import AuditLog


class ValidationIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationIssue
        fields = ["id", "severity", "issue_type", "message", "resolved", "created_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source="changed_by.username", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "action",
            "old_value",
            "new_value",
            "changed_by_username",
            "changed_at",
        ]


class RawRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawRecord
        fields = [
            "id",
            "row_number",
            "raw_payload",
            "processing_status",
            "processing_error",
            "created_at",
        ]


class ActivityListSerializer(serializers.ModelSerializer):
    issue_count = serializers.IntegerField(read_only=True, default=0)
    highest_severity = serializers.CharField(read_only=True, allow_null=True)
    amount_display = serializers.SerializerMethodField()

    class Meta:
        model = NormalizedActivity
        fields = [
            "id",
            "source_type",
            "activity_type",
            "scope",
            "activity_date",
            "quantity",
            "unit",
            "spend_amount",
            "currency",
            "amount_display",
            "estimated_emissions_kgco2e",
            "source_reference_id",
            "review_status",
            "locked_for_audit",
            "issue_count",
            "highest_severity",
            "created_at",
        ]

    def get_amount_display(self, obj):
        if obj.quantity is not None:
            return f"{obj.quantity} {obj.normalized_unit or obj.unit}"
        if obj.spend_amount is not None:
            return f"{obj.spend_amount} {obj.currency}".strip()
        return "—"


class ActivityDetailSerializer(ActivityListSerializer):
    raw_record = RawRecordSerializer(read_only=True)
    validation_issues = ValidationIssueSerializer(many=True, read_only=True)
    audit_logs = AuditLogSerializer(many=True, read_only=True)

    class Meta(ActivityListSerializer.Meta):
        fields = ActivityListSerializer.Meta.fields + [
            "normalized_unit",
            "facility",
            "vendor",
            "metadata",
            "review_comment",
            "approved_at",
            "locked_at",
            "updated_at",
            "raw_record",
            "validation_issues",
            "audit_logs",
        ]


class ReviewActionSerializer(serializers.Serializer):
    review_comment = serializers.CharField(required=False, allow_blank=True, default="")
