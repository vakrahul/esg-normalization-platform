from django.contrib import admin

from .models import DataSource, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")


@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    list_display = ("organization", "source_type", "ingestion_method", "created_at")
    list_filter = ("source_type", "ingestion_method")
