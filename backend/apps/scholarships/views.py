from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.scholarships.models import Assignment, DepartmentHeadProfile, Student, TeacherProfile
from apps.scholarships.serializers import AssignmentSerializer, DepartmentHeadProfileSerializer, StudentSerializer, TeacherProfileSerializer


class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Student.objects.select_related('user', 'career', 'study_plan').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


class TeacherProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeacherProfile.objects.select_related('user').all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated]


class DepartmentHeadProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DepartmentHeadProfile.objects.select_related('user', 'career').all()
    serializer_class = DepartmentHeadProfileSerializer
    permission_classes = [IsAuthenticated]


class AssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Assignment.objects.select_related('student', 'subarea', 'teacher_profile', 'term').all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
from django.shortcuts import render

# Create your views here.
