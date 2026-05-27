from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.services import reset_demo_ingestion


class DemoResetView(APIView):
    """Clear all import batches and review data for the default tenant (demo reset)."""

    def post(self, request):
        deleted = reset_demo_ingestion()
        return Response(
            {"detail": "Demo data cleared.", "deleted_rows": deleted},
            status=status.HTTP_200_OK,
        )
