from apps.core.services import get_default_organization
from apps.normalization.emissions import estimate_emissions
from apps.normalization.models import NormalizedActivity
from apps.review.audit import log_activity_action
from apps.review.models import AuditLog


class BaseNormalizer:
    source_type = None

    def normalize(self, raw_record) -> NormalizedActivity:
        org = get_default_organization()
        data = self._build_activity_fields(raw_record)
        activity = NormalizedActivity.objects.create(
            organization=org,
            raw_record=raw_record,
            source_type=self.source_type,
            **data,
        )
        activity.estimated_emissions_kgco2e = estimate_emissions(activity)
        activity.save(update_fields=["estimated_emissions_kgco2e", "updated_at"])
        log_activity_action(
            activity,
            AuditLog.ACTION_NORMALIZED,
            new_value={"activity_type": activity.activity_type, "scope": activity.scope},
        )
        return activity

    def _build_activity_fields(self, raw_record) -> dict:
        raise NotImplementedError
