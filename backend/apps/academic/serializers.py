from rest_framework import serializers

from apps.academic.models import Career, StudyPlan, Term


class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = ['id', 'code', 'name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ['id', 'code', 'name', 'period_type', 'periods_per_year', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ['id', 'academic_year', 'study_plan', 'sequence_number', 'name', 'start_date', 'end_date', 'is_closed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
