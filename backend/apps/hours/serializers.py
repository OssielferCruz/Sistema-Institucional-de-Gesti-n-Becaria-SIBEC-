from rest_framework import serializers

from apps.academic.models import Term
from apps.hours.models import HoursEvidence, HoursLog, HoursPolicy, HoursPolicySegment
from apps.accounts.models import User
from apps.scholarships.models import Assignment, Student, TeacherProfile


class HoursPolicySegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoursPolicySegment
        fields = ['id', 'policy', 'study_plan', 'period_sequence', 'target_hours', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HoursPolicySerializer(serializers.ModelSerializer):
    segments = HoursPolicySegmentSerializer(many=True, read_only=True)

    class Meta:
        model = HoursPolicy
        fields = [
            'id', 'name', 'version', 'annual_target_hours', 'is_active', 'valid_from', 'valid_to',
            'description', 'created_by', 'segments', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HoursEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoursEvidence
        fields = ['id', 'hours_log', 'file_url', 'original_name', 'mime_type', 'uploaded_by', 'created_at']
        read_only_fields = ['id', 'created_at']


class HoursLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoursLog
        fields = [
            'id', 'student', 'assignment', 'teacher_profile', 'term', 'work_date', 'start_time', 'end_time',
            'reported_hours', 'description', 'status', 'locked_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'locked_at', 'created_at', 'updated_at']

    def validate(self, attrs):
        assignment = attrs.get('assignment')
        student = attrs.get('student')
        teacher_profile = attrs.get('teacher_profile')
        term = attrs.get('term')
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if not assignment or not student or not teacher_profile or not term:
            return attrs

        if user and user.is_authenticated and user.role:
            if user.role.code == 'docente':
                if not hasattr(user, 'teacher_profile'):
                    raise serializers.ValidationError({'teacher_profile': 'Teacher profile not found for the authenticated user.'})
                if teacher_profile != user.teacher_profile:
                    raise serializers.ValidationError({'teacher_profile': 'Teachers can only register logs for their own profile.'})
            elif user.role.code not in {'admin'}:
                raise serializers.ValidationError('Only admin and teacher roles can create hours logs.')

        if assignment.student_id != student.id:
            raise serializers.ValidationError({'assignment': 'The assignment must belong to the selected student.'})
        if assignment.teacher_profile_id != teacher_profile.id:
            raise serializers.ValidationError({'teacher_profile': 'The assignment must belong to the selected teacher.'})
        if assignment.term_id != term.id:
            raise serializers.ValidationError({'term': 'The assignment must belong to the selected term.'})
        if assignment.status != 'active':
            raise serializers.ValidationError({'assignment': 'Only active assignments can receive hours logs.'})
        if term.is_closed:
            raise serializers.ValidationError({'term': 'Closed terms cannot receive new hours logs.'})

        return attrs


class StudentProgressSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    student_code = serializers.CharField()
    student_name = serializers.CharField()
    study_plan = serializers.CharField()
    career = serializers.CharField()
    approved_hours = serializers.DecimalField(max_digits=8, decimal_places=2)
    target_hours = serializers.DecimalField(max_digits=8, decimal_places=2)
    remaining_hours = serializers.DecimalField(max_digits=8, decimal_places=2)
    policy_name = serializers.CharField(allow_null=True)
    period_sequence = serializers.IntegerField(allow_null=True)
    annual_target_hours = serializers.DecimalField(max_digits=8, decimal_places=2)


class StudentProgressQuerySerializer(serializers.Serializer):
    student_id = serializers.UUIDField(required=False)
