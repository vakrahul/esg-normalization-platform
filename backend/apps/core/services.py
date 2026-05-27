from django.conf import settings

from .models import DataSource, Organization


def get_default_organization():
    orgs = Organization.objects.all()
    if orgs.count() == 1:
        return orgs.get()
    org, _ = Organization.objects.get_or_create(name=settings.DEFAULT_ORGANIZATION_NAME)
    return org


def get_or_create_datasource(source_type, ingestion_method, organization=None):
    org = organization or get_default_organization()
    ds, _ = DataSource.objects.get_or_create(
        organization=org,
        source_type=source_type,
        defaults={"ingestion_method": ingestion_method},
    )
    return ds


def reset_demo_ingestion(organization=None):
    """Remove all import batches (and cascaded activities) for the tenant."""
    from apps.ingestion.models import ImportBatch

    org = organization or get_default_organization()
    qs = ImportBatch.objects.filter(datasource__organization=org)
    deleted_count, _ = qs.delete()
    return deleted_count
