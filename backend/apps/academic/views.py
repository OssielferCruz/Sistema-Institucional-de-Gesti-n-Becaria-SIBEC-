from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.academic.models import Career, StudyPlan, Term
from apps.academic.serializers import CareerSerializer, StudyPlanSerializer, TermSerializer


class CareerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
    permission_classes = [IsAuthenticated]


class StudyPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StudyPlan.objects.all()
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]


class TermViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Term.objects.select_related('study_plan').all()
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated]
from django.shortcuts import render

# Create your views here.
