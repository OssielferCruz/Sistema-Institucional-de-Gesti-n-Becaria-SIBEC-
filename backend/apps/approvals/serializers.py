from rest_framework import serializers

from apps.approvals.models import HoursReview


class HoursReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoursReview
        fields = ['id', 'hours_log', 'reviewer', 'decision', 'comments', 'reviewed_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'reviewed_at', 'created_at', 'updated_at']
