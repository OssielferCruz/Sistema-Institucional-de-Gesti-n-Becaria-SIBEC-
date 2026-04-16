from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import IsAdminRole
from apps.organization.models import Area, Subarea
from apps.organization.serializers import AreaSerializer, SubareaSerializer


class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [IsAuthenticated]


class SubareaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subarea.objects.select_related('area').all()
    serializer_class = SubareaSerializer
    permission_classes = [IsAuthenticated]
from django.shortcuts import render

# Create your views here.
