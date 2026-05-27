from django.contrib import admin

from .models import ImportBatch, RawRecord


class RawRecordInline(admin.TabularInline):
    model = RawRecord
    extra = 0
    readonly_fields = ("row_number", "raw_payload", "processing_status", "processing_error", "created_at")
    can_delete = False


@admin.register(ImportBatch)
class ImportBatchAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "datasource",
        "status",
        "row_count",
        "success_count",
        "flagged_count",
        "failed_count",
        "imported_at",
    )
    list_filter = ("status", "datasource__source_type")
    inlines = [RawRecordInline]


@admin.register(RawRecord)
class RawRecordAdmin(admin.ModelAdmin):
    list_display = ("import_batch", "row_number", "processing_status", "created_at")
    readonly_fields = ("import_batch", "row_number", "raw_payload", "created_at")
