import json

from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import DataSource
from apps.core.tenancy import get_tenant_organization, import_batches_for_tenant
from apps.ingestion.models import ImportBatch
from apps.ingestion.serializers import ImportBatchDetailSerializer, ImportBatchSerializer
from apps.ingestion.services import import_csv_file, import_travel_fixture, import_travel_json_file


class SAPImportView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "file is required."}, status=status.HTTP_400_BAD_REQUEST)
        org = get_tenant_organization(request)
        batch = import_csv_file(DataSource.SOURCE_SAP, DataSource.METHOD_CSV, file, organization=org)
        return Response(ImportBatchSerializer(batch).data, status=status.HTTP_201_CREATED)


class UtilityImportView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "file is required."}, status=status.HTTP_400_BAD_REQUEST)
        org = get_tenant_organization(request)
        batch = import_csv_file(DataSource.SOURCE_UTILITY, DataSource.METHOD_CSV, file, organization=org)
        return Response(ImportBatchSerializer(batch).data, status=status.HTTP_201_CREATED)


class TravelSyncView(APIView):
    def post(self, request):
        dataset = request.query_params.get("dataset", "default")
        try:
            org = get_tenant_organization(request)
            batch = import_travel_fixture(dataset=dataset, organization=org)
        except FileNotFoundError:
            return Response(
                {"detail": "Travel fixture file not found."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except (ValueError, json.JSONDecodeError) as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ImportBatchSerializer(batch).data, status=status.HTTP_201_CREATED)


class TravelImportView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "file is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            org = get_tenant_organization(request)
            batch = import_travel_json_file(file, organization=org)
        except json.JSONDecodeError:
            return Response({"detail": "Invalid JSON file."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ImportBatchSerializer(batch).data, status=status.HTTP_201_CREATED)


class ImportBatchListView(generics.ListAPIView):
    serializer_class = ImportBatchSerializer

    def get_queryset(self):
        return (
            import_batches_for_tenant(self.request)
            .select_related("datasource")
            .order_by("-imported_at")
        )


class ImportBatchDetailView(generics.RetrieveAPIView):
    serializer_class = ImportBatchDetailSerializer

    def get_queryset(self):
        return import_batches_for_tenant(self.request).select_related("datasource")
