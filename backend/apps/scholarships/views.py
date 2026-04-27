from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import IsAdminRole
from apps.scholarships.models import Assignment, DepartmentHeadProfile, Student, TeacherProfile
from apps.scholarships.serializers import (
    AssignmentSerializer,
    DepartmentHeadProfileSerializer,
    StudentImportSerializer,
    StudentSerializer,
    TeacherProfileSerializer,
)
from apps.scholarships.services import import_students_from_csv


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user', 'career', 'study_plan').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminRole])
    def import_csv(self, request):
        serializer = StudentImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = import_students_from_csv(serializer.validated_data['file'])
        status_code = status.HTTP_201_CREATED if not result['errors'] else status.HTTP_207_MULTI_STATUS
        return Response(result, status=status_code)


class TeacherProfileViewSet(viewsets.ModelViewSet):
    queryset = TeacherProfile.objects.select_related('user').all()
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()


class DepartmentHeadProfileViewSet(viewsets.ModelViewSet):
    queryset = DepartmentHeadProfile.objects.select_related('user', 'career').all()
    serializer_class = DepartmentHeadProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related('student', 'subarea', 'teacher_profile', 'term').all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

