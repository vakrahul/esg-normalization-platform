from django.urls import include, path

from apps.core.health import HealthView
from apps.core.views import DemoResetView
from apps.ingestion import views as ingestion_views
from apps.review import views as review_views

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("demo/reset/", DemoResetView.as_view(), name="demo-reset"),
    path("auth/", include("apps.review.auth_urls")),
    path("imports/sap/", ingestion_views.SAPImportView.as_view(), name="import-sap"),
    path("imports/utility/", ingestion_views.UtilityImportView.as_view(), name="import-utility"),
    path(
        "imports/travel-sync/",
        ingestion_views.TravelSyncView.as_view(),
        name="import-travel-sync",
    ),
    path("imports/travel/", ingestion_views.TravelImportView.as_view(), name="import-travel"),
    path("import-batches/", ingestion_views.ImportBatchListView.as_view(), name="import-batches"),
    path(
        "import-batches/<int:pk>/",
        ingestion_views.ImportBatchDetailView.as_view(),
        name="import-batch-detail",
    ),
    path("activities/summary/", review_views.ActivitySummaryView.as_view(), name="activity-summary"),
    path("activities/", review_views.ActivityListView.as_view(), name="activity-list"),
    path("activities/<int:pk>/", review_views.ActivityDetailView.as_view(), name="activity-detail"),
    path(
        "activities/<int:pk>/approve/",
        review_views.ActivityApproveView.as_view(),
        name="activity-approve",
    ),
    path(
        "activities/<int:pk>/reject/",
        review_views.ActivityRejectView.as_view(),
        name="activity-reject",
    ),
    path(
        "activities/<int:pk>/lock/",
        review_views.ActivityLockView.as_view(),
        name="activity-lock",
    ),
]
