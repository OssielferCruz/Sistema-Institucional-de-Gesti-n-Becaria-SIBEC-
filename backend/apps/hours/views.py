from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsAdminRole, IsDepartmentHeadRole
from apps.hours.models import HoursEvidence, HoursLog, HoursPolicy, HoursPolicySegment
from apps.hours.serializers import (
    HoursEvidenceSerializer,
    HoursLogSerializer,
    HoursPolicySegmentSerializer,
    HoursPolicySerializer,
    StudentProgressQuerySerializer,
    StudentProgressSerializer,
)
from apps.hours.services import get_student_progress
from apps.scholarships.models import Student, TeacherProfile
from apps.approvals.models import HoursReview


class HoursPolicyViewSet(viewsets.ModelViewSet):
    queryset = HoursPolicy.objects.prefetch_related('segments').all()
    serializer_class = HoursPolicySerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class HoursPolicySegmentViewSet(viewsets.ModelViewSet):
    queryset = HoursPolicySegment.objects.select_related('policy', 'study_plan').all()
    serializer_class = HoursPolicySegmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]


class HoursEvidenceViewSet(viewsets.ModelViewSet):
    queryset = HoursEvidence.objects.select_related('hours_log', 'uploaded_by').all()
    serializer_class = HoursEvidenceSerializer
    permission_classes = [IsAuthenticated]


class HoursLogViewSet(viewsets.ModelViewSet):
    queryset = HoursLog.objects.select_related('student', 'assignment', 'teacher_profile', 'term').all()
    serializer_class = HoursLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_superuser or (user.role and user.role.code == 'admin'):
            return queryset
        if user.role and user.role.code == 'docente' and hasattr(user, 'teacher_profile'):
            return queryset.filter(teacher_profile=user.teacher_profile)
        if user.role and user.role.code == 'jefatura' and hasattr(user, 'department_head_profile'):
            return queryset.filter(student__career=user.department_head_profile.career)
        if user.role and user.role.code == 'estudiante' and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsDepartmentHeadRole])
    def approve(self, request, pk=None):
        hours_log = self.get_object()
        if not hasattr(request.user, 'department_head_profile'):
            return Response({'detail': 'Department head profile not found.'}, status=status.HTTP_403_FORBIDDEN)
        if hours_log.student.career_id != request.user.department_head_profile.career_id:
            return Response({'detail': 'You cannot approve this log.'}, status=status.HTTP_403_FORBIDDEN)
        HoursReview.objects.update_or_create(
            hours_log=hours_log,
            defaults={
                'reviewer': request.user.department_head_profile,
                'decision': 'approved',
                'comments': request.data.get('comments', ''),
            },
        )
        hours_log.status = 'approved'
        hours_log.locked_at = hours_log.locked_at or timezone.now()
        hours_log.save(update_fields=['status', 'locked_at', 'updated_at'])
        return Response(self.get_serializer(hours_log).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsDepartmentHeadRole])
    def reject(self, request, pk=None):
        hours_log = self.get_object()
        if not hasattr(request.user, 'department_head_profile'):
            return Response({'detail': 'Department head profile not found.'}, status=status.HTTP_403_FORBIDDEN)
        if hours_log.student.career_id != request.user.department_head_profile.career_id:
            return Response({'detail': 'You cannot reject this log.'}, status=status.HTTP_403_FORBIDDEN)
        HoursReview.objects.update_or_create(
            hours_log=hours_log,
            defaults={
                'reviewer': request.user.department_head_profile,
                'decision': 'rejected',
                'comments': request.data.get('comments', ''),
            },
        )
        hours_log.status = 'rejected'
        hours_log.locked_at = hours_log.locked_at or timezone.now()
        hours_log.save(update_fields=['status', 'locked_at', 'updated_at'])
        return Response(self.get_serializer(hours_log).data)


class ProgressViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not hasattr(request.user, 'student_profile'):
            return Response({'detail': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        progress = get_student_progress(request.user.student_profile)
        serializer = StudentProgressSerializer(progress)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        query_serializer = StudentProgressQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)

        student_id = query_serializer.validated_data.get('student_id')
        if student_id:
            if not (request.user.is_superuser or (request.user.role and request.user.role.code == 'admin')):
                return Response({'detail': 'Only admin users can consult arbitrary students.'}, status=status.HTTP_403_FORBIDDEN)
            student = Student.objects.select_related('user', 'career', 'study_plan').get(id=student_id)
        elif hasattr(request.user, 'student_profile'):
            student = request.user.student_profile
        else:
            return Response({'detail': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        progress = get_student_progress(student)
        serializer = StudentProgressSerializer(progress)
        return Response(serializer.data)
