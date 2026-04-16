from django.db import models

from apps.academic.models import StudyPlan, Term
from apps.accounts.models import User
from apps.common.models import UUIDTimeStampedModel
from apps.scholarships.models import Assignment, Student, TeacherProfile


class HoursPolicy(UUIDTimeStampedModel):
	name = models.CharField(max_length=120)
	version = models.PositiveIntegerField(default=1)
	annual_target_hours = models.PositiveIntegerField(default=150)
	is_active = models.BooleanField(default=False)
	valid_from = models.DateField()
	valid_to = models.DateField(null=True, blank=True)
	description = models.TextField(blank=True)
	created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_policies')

	class Meta:
		ordering = ['-version']
		constraints = [
			models.UniqueConstraint(fields=['name', 'version'], name='uniq_policy_name_version'),
			models.CheckConstraint(condition=models.Q(annual_target_hours__gt=0), name='policy_target_positive'),
			models.CheckConstraint(condition=models.Q(valid_to__isnull=True) | models.Q(valid_to__gte=models.F('valid_from')), name='policy_dates_valid'),
		]


class HoursPolicySegment(UUIDTimeStampedModel):
	policy = models.ForeignKey(HoursPolicy, on_delete=models.CASCADE, related_name='segments')
	study_plan = models.ForeignKey(StudyPlan, on_delete=models.PROTECT, related_name='policy_segments')
	period_sequence = models.PositiveSmallIntegerField()
	target_hours = models.PositiveIntegerField()

	class Meta:
		ordering = ['policy', 'study_plan', 'period_sequence']
		constraints = [
			models.UniqueConstraint(fields=['policy', 'study_plan', 'period_sequence'], name='uniq_policy_plan_period'),
			models.CheckConstraint(condition=models.Q(target_hours__gte=0), name='policy_segment_non_negative'),
		]


class HoursLog(UUIDTimeStampedModel):
	student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name='hours_logs')
	assignment = models.ForeignKey(Assignment, on_delete=models.PROTECT, related_name='hours_logs')
	teacher_profile = models.ForeignKey(TeacherProfile, on_delete=models.PROTECT, related_name='hours_logs')
	term = models.ForeignKey(Term, on_delete=models.PROTECT, related_name='hours_logs')
	work_date = models.DateField()
	start_time = models.TimeField()
	end_time = models.TimeField()
	reported_hours = models.DecimalField(max_digits=5, decimal_places=2)
	description = models.TextField()
	status = models.CharField(max_length=30, default='registered')
	locked_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ['-work_date', '-created_at']
		constraints = [
			models.CheckConstraint(condition=models.Q(end_time__gt=models.F('start_time')), name='hours_time_range_valid'),
			models.CheckConstraint(condition=models.Q(reported_hours__gt=0), name='hours_reported_positive'),
		]


class HoursEvidence(UUIDTimeStampedModel):
	hours_log = models.ForeignKey(HoursLog, on_delete=models.CASCADE, related_name='evidences')
	file_url = models.CharField(max_length=500)
	original_name = models.CharField(max_length=255)
	mime_type = models.CharField(max_length=100)
	uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='uploaded_evidences')

