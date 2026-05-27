from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("activity", "action", "changed_by", "changed_at")
    list_filter = ("action",)
    readonly_fields = ("activity", "action", "old_value", "new_value", "changed_by", "changed_at")

    def has_delete_permission(self, request, obj=None):
        return False
