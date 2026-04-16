from rest_framework import serializers

from apps.academic.models import Career, StudyPlan, Term
from apps.academic.serializers import CareerSerializer, StudyPlanSerializer, TermSerializer
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.organization.serializers import SubareaSerializer
from apps.organization.models import Subarea
from apps.scholarships.models import Assignment, DepartmentHeadProfile, Student, TeacherProfile


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', queryset=User.objects.all(), write_only=True)
    career = CareerSerializer(read_only=True)
    career_id = serializers.PrimaryKeyRelatedField(source='career', queryset=Career.objects.all(), write_only=True)
    study_plan = StudyPlanSerializer(read_only=True)
    study_plan_id = serializers.PrimaryKeyRelatedField(source='study_plan', queryset=StudyPlan.objects.all(), write_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'user_id', 'student_code', 'career', 'career_id', 'study_plan', 'study_plan_id', 'admission_year', 'scholarship_status', 'required_annual_hours', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', queryset=User.objects.all(), write_only=True)

    class Meta:
        model = TeacherProfile
        fields = ['id', 'user', 'user_id', 'employee_code', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DepartmentHeadProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', queryset=User.objects.all(), write_only=True)
    career = CareerSerializer(read_only=True)
    career_id = serializers.PrimaryKeyRelatedField(source='career', queryset=Career.objects.all(), write_only=True)

    class Meta:
        model = DepartmentHeadProfile
        fields = ['id', 'user', 'user_id', 'career', 'career_id', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssignmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(source='student', queryset=Student.objects.all(), write_only=True)
    subarea = SubareaSerializer(read_only=True)
    subarea_id = serializers.PrimaryKeyRelatedField(source='subarea', queryset=Subarea.objects.all(), write_only=True)
    teacher_profile = TeacherProfileSerializer(read_only=True)
    teacher_profile_id = serializers.PrimaryKeyRelatedField(source='teacher_profile', queryset=TeacherProfile.objects.all(), write_only=True)
    term = TermSerializer(read_only=True)
    term_id = serializers.PrimaryKeyRelatedField(source='term', queryset=Term.objects.all(), write_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'student', 'student_id', 'subarea', 'subarea_id', 'teacher_profile', 'teacher_profile_id', 'term', 'term_id', 'assigned_at', 'end_at', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'assigned_at', 'created_at', 'updated_at']


class StudentImportSerializer(serializers.Serializer):
    file = serializers.FileField()
