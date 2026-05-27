import csv
import json
from io import TextIOWrapper
from pathlib import Path

from django.conf import settings

from apps.core.models import DataSource
from apps.core.services import get_or_create_datasource
from apps.ingestion.models import ImportBatch, RawRecord
from apps.normalization.pipeline import process_batch


def create_batch_from_rows(datasource, filename, rows):
    batch = ImportBatch.objects.create(
        datasource=datasource,
        original_filename=filename or "",
        status=ImportBatch.STATUS_PROCESSING,
        row_count=len(rows),
    )
    for idx, row in enumerate(rows, start=1):
        RawRecord.objects.create(
            import_batch=batch,
            row_number=idx,
            raw_payload=row,
            processing_status=RawRecord.STATUS_PENDING,
        )
    process_batch(batch)
    return batch


def import_csv_file(source_type, ingestion_method, uploaded_file, organization=None):
    datasource = get_or_create_datasource(source_type, ingestion_method, organization)
    wrapper = TextIOWrapper(uploaded_file.file, encoding="utf-8-sig")
    reader = csv.DictReader(wrapper)
    rows = [dict(row) for row in reader]
    return create_batch_from_rows(
        datasource,
        getattr(uploaded_file, "name", ""),
        rows,
    )


def _samples_path(name):
    return Path(settings.BASE_DIR).parent / "samples" / name


TRAVEL_DATASETS = {
    "default": lambda: Path(settings.TRAVEL_FIXTURE_PATH),
    "domestic": lambda: _samples_path("travel_domestic_trips.json"),
    "international": lambda: _samples_path("travel_international_trips.json"),
}


def _load_travel_rows(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Travel data must be a JSON array of itinerary objects.")
    return data


def import_travel_fixture(dataset="default", organization=None):
    datasource = get_or_create_datasource(
        DataSource.SOURCE_TRAVEL, DataSource.METHOD_API, organization
    )
    resolver = TRAVEL_DATASETS.get(dataset)
    if not resolver:
        raise ValueError(f"Unknown travel dataset: {dataset}")
    path = resolver()
    rows = _load_travel_rows(path)
    return create_batch_from_rows(datasource, path.name, rows)


def import_travel_json_file(uploaded_file, organization=None):
    datasource = get_or_create_datasource(
        DataSource.SOURCE_TRAVEL, DataSource.METHOD_API, organization
    )
    content = uploaded_file.read().decode("utf-8-sig")
    data = json.loads(content)
    if not isinstance(data, list):
        raise ValueError("Travel file must be a JSON array.")
    return create_batch_from_rows(
        datasource,
        getattr(uploaded_file, "name", "travel.json"),
        data,
    )
