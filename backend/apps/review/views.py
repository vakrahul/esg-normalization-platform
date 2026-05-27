from django.db.models import Case, Count, IntegerField, Max, Q, Value, When
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.tenancy import activities_for_tenant
from apps.normalization.models import NormalizedActivity, ValidationIssue
from apps.review.audit import log_activity_action
from apps.review.guards import ensure_can_lock, ensure_not_locked
from apps.review.models import AuditLog
from apps.review.serializers import (
    ActivityDetailSerializer,
    ActivityListSerializer,
    ReviewActionSerializer,
)

SEVERITY_FROM_RANK = {
    3: ValidationIssue.SEVERITY_HIGH,
    2: ValidationIssue.SEVERITY_MEDIUM,
    1: ValidationIssue.SEVERITY_LOW,
}


def _annotate_activities(qs):
    severity_case = Case(
        When(
            validation_issues__severity=ValidationIssue.SEVERITY_HIGH,
            validation_issues__resolved=False,
            then=Value(3),
        ),
        When(
            validation_issues__severity=ValidationIssue.SEVERITY_MEDIUM,
            validation_issues__resolved=False,
            then=Value(2),
        ),
        When(
            validation_issues__severity=ValidationIssue.SEVERITY_LOW,
            validation_issues__resolved=False,
            then=Value(1),
        ),
        default=Value(0),
        output_field=IntegerField(),
    )
    return qs.annotate(
        issue_count=Count(
            "validation_issues",
            filter=Q(validation_issues__resolved=False),
            distinct=True,
        ),
        severity_rank=Max(severity_case),
    )


def _attach_highest_severity(instances):
    for obj in instances:
        rank = getattr(obj, "severity_rank", 0) or 0
        obj.highest_severity = SEVERITY_FROM_RANK.get(rank)


class ActivityListView(generics.ListAPIView):
    serializer_class = ActivityListSerializer

    def get_queryset(self):
        qs = activities_for_tenant(self.request).select_related("raw_record").prefetch_related(
            "validation_issues"
        )
        params = self.request.query_params
        if source := params.get("source"):
            qs = qs.filter(source_type=source)
        if review_status := params.get("review_status"):
            qs = qs.filter(review_status=review_status)
        if scope := params.get("scope"):
            qs = qs.filter(scope=scope)
        if severity := params.get("severity"):
            qs = qs.filter(
                validation_issues__severity=severity,
                validation_issues__resolved=False,
            ).distinct()
        if params.get("has_issues") == "true":
            qs = qs.filter(
                validation_issues__resolved=False,
            ).distinct()
        qs = _annotate_activities(qs).order_by("-created_at")
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        items = page if page is not None else queryset
        _attach_highest_severity(items)
        serializer = self.get_serializer(items, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


class ActivityDetailView(generics.RetrieveAPIView):
    serializer_class = ActivityDetailSerializer

    def get_queryset(self):
        qs = activities_for_tenant(self.request).select_related("raw_record").prefetch_related(
            "validation_issues", "audit_logs", "audit_logs__changed_by"
        )
        return _annotate_activities(qs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        _attach_highest_severity([instance])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ActivitySummaryView(APIView):
    def get(self, request):
        qs = activities_for_tenant(request)
        with_issues = qs.filter(validation_issues__resolved=False).distinct().count()
        return Response(
            {
                "total": qs.count(),
                "imported": qs.count(),
                "flagged": qs.filter(review_status=NormalizedActivity.REVIEW_FLAGGED).count(),
                "approved": qs.filter(review_status=NormalizedActivity.REVIEW_APPROVED).count(),
                "rejected": qs.filter(review_status=NormalizedActivity.REVIEW_REJECTED).count(),
                "locked": qs.filter(locked_for_audit=True).count(),
                "pending": qs.filter(review_status=NormalizedActivity.REVIEW_PENDING).count(),
                "with_issues": with_issues,
            }
        )


class ActivityApproveView(APIView):
    def post(self, request, pk):
        activity = activities_for_tenant(request).get(pk=pk)
        ensure_not_locked(activity)
        ser = ReviewActionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        comment = ser.validated_data.get("review_comment", "")
        old = {"review_status": activity.review_status}
        activity.review_status = NormalizedActivity.REVIEW_APPROVED
        activity.review_comment = comment or activity.review_comment
        activity.approved_at = timezone.now()
        activity.save(update_fields=["review_status", "review_comment", "approved_at", "updated_at"])
        log_activity_action(
            activity,
            AuditLog.ACTION_APPROVED,
            user=request.user,
            old_value=old,
            new_value={"review_status": activity.review_status, "review_comment": comment},
        )
        return Response(ActivityDetailSerializer(activity).data)


class ActivityRejectView(APIView):
    def post(self, request, pk):
        activity = activities_for_tenant(request).get(pk=pk)
        ensure_not_locked(activity)
        ser = ReviewActionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        comment = ser.validated_data.get("review_comment", "")
        old = {"review_status": activity.review_status}
        activity.review_status = NormalizedActivity.REVIEW_REJECTED
        activity.review_comment = comment or activity.review_comment
        activity.save(update_fields=["review_status", "review_comment", "updated_at"])
        log_activity_action(
            activity,
            AuditLog.ACTION_REJECTED,
            user=request.user,
            old_value=old,
            new_value={"review_status": activity.review_status, "review_comment": comment},
        )
        return Response(ActivityDetailSerializer(activity).data)


class ActivityLockView(APIView):
    def post(self, request, pk):
        activity = activities_for_tenant(request).get(pk=pk)
        ensure_not_locked(activity)
        ensure_can_lock(activity)
        old = {"locked_for_audit": activity.locked_for_audit}
        activity.locked_for_audit = True
        activity.locked_at = timezone.now()
        activity.save(update_fields=["locked_for_audit", "locked_at", "updated_at"])
        log_activity_action(
            activity,
            AuditLog.ACTION_LOCKED,
            user=request.user,
            old_value=old,
            new_value={"locked_for_audit": True, "locked_at": activity.locked_at.isoformat()},
        )
        return Response(ActivityDetailSerializer(activity).data)
