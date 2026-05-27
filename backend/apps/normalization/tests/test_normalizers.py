from django.test import TestCase

from apps.core.models import DataSource, Organization
from apps.ingestion.models import ImportBatch, RawRecord
from apps.normalization.models import NormalizedActivity
from apps.normalization.pipeline import process_raw_record
from apps.normalization.services.sap_aliases import normalize_sap_payload


class NormalizerTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.sap_ds = DataSource.objects.create(
            organization=self.org,
            source_type=DataSource.SOURCE_SAP,
            ingestion_method=DataSource.METHOD_CSV,
        )

    def _raw(self, payload):
        batch = ImportBatch.objects.create(datasource=self.sap_ds, row_count=1)
        return RawRecord.objects.create(
            import_batch=batch,
            row_number=1,
            raw_payload=payload,
        )

    def test_sap_fuel_scope_1(self):
        raw = self._raw(
            {
                "TransactionType": "Fuel Purchase",
                "TransactionAmount": "1000",
                "Currency": "USD",
                "TransactionDate": "2026-01-12",
                "DocumentNumber": "PR1",
                "Accounting_CostCenter": "CC100",
            },
        )
        self.assertTrue(process_raw_record(raw))
        act = raw.normalized_activity
        self.assertEqual(act.scope, NormalizedActivity.SCOPE_1)
        self.assertEqual(act.activity_type, NormalizedActivity.ACTIVITY_FUEL)

    def test_sap_procurement_scope_3(self):
        raw = self._raw(
            {
                "TransactionType": "Procurement",
                "TransactionAmount": "500",
                "Currency": "USD",
                "TransactionDate": "2026-01-12",
                "DocumentNumber": "PR2",
                "Accounting_CostCenter": "CC200",
            },
        )
        self.assertTrue(process_raw_record(raw))
        self.assertEqual(raw.normalized_activity.scope, NormalizedActivity.SCOPE_3)

    def test_sap_german_column_aliases(self):
        de_row = {
            "Geschäftsjahr": "2026",
            "Belegart": "Kraftstoff",
            "Betrag": "8400",
            "Währung": "EUR",
            "Buchungsdatum": "2026-02-01",
            "Belegnummer": "DE-9001",
            "Kostenstelle": "CC310",
        }
        canonical = normalize_sap_payload(de_row)
        self.assertEqual(canonical["FiscalYear"], "2026")
        self.assertEqual(canonical["TransactionType"], "Kraftstoff")
        raw = self._raw(de_row)
        self.assertTrue(process_raw_record(raw))
        self.assertEqual(raw.normalized_activity.currency, "EUR")
