from django.contrib import admin

from .models import NormalizedActivity, ValidationIssue


class ValidationIssueInline(admin.TabularInline):
    model = ValidationIssue
    extra = 0


@admin.register(NormalizedActivity)
class NormalizedActivityAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "source_type",
        "activity_type",
        "scope",
        "review_status",
        "locked_for_audit",
        "source_reference_id",
    )
    list_filter = ("source_type", "activity_type", "scope", "review_status", "locked_for_audit")
    inlines = [ValidationIssueInline]
    readonly_fields = ("raw_record", "created_at", "updated_at")


@admin.register(ValidationIssue)
class ValidationIssueAdmin(admin.ModelAdmin):
    list_display = ("activity", "issue_type", "severity", "resolved", "created_at")
    list_filter = ("severity", "issue_type", "resolved")
