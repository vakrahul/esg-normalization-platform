from apps.core.models import DataSource

from .sap_normalizer import SAPNormalizer
from .travel_normalizer import TravelNormalizer
from .utility_normalizer import UtilityNormalizer

NORMALIZERS = {
    DataSource.SOURCE_SAP: SAPNormalizer,
    DataSource.SOURCE_UTILITY: UtilityNormalizer,
    DataSource.SOURCE_TRAVEL: TravelNormalizer,
}


def get_normalizer(source_type):
    cls = NORMALIZERS.get(source_type)
    if not cls:
        raise ValueError(f"No normalizer for source type: {source_type}")
    return cls()
