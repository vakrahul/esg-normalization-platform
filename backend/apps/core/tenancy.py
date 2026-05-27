from apps.core.services import get_default_organization


def get_tenant_organization(request=None):
    """Prototype: single default client; all data scoped to one organization."""
    return get_default_organization()


def activities_for_tenant(request=None):
    from apps.normalization.models import NormalizedActivity

    org = get_tenant_organization(request)
    return NormalizedActivity.objects.filter(organization=org)


def import_batches_for_tenant(request=None):
    from apps.ingestion.models import ImportBatch

    org = get_tenant_organization(request)
    return ImportBatch.objects.filter(datasource__organization=org)
