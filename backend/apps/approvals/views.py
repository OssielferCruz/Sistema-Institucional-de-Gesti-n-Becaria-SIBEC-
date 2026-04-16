from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.approvals.models import HoursReview
from apps.approvals.serializers import HoursReviewSerializer


class HoursReviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HoursReview.objects.select_related('hours_log', 'reviewer', 'reviewer__user').all()
    serializer_class = HoursReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_superuser or (user.role and user.role.code == 'admin'):
            return queryset
        if user.role and user.role.code == 'jefatura' and hasattr(user, 'department_head_profile'):
            return queryset.filter(reviewer=user.department_head_profile)
        return queryset.none()
from django.shortcuts import render

# Create your views here.
