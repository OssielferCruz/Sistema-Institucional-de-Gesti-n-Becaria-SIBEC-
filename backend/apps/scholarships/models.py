from django.db import models

from apps.academic.models import Career, StudyPlan, Term
from apps.accounts.models import User
from apps.common.models import ActiveModel, UUIDTimeStampedModel
from apps.organization.models import Subarea


class Student(UUIDTimeStampedModel, ActiveModel):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
	student_code = models.SlugField(max_length=30, unique=True)
	career = models.ForeignKey(Career, on_delete=models.PROTECT, related_name='students')
	study_plan = models.ForeignKey(StudyPlan, on_delete=models.PROTECT, related_name='students')
	admission_year = models.PositiveSmallIntegerField()
	scholarship_status = models.CharField(max_length=30, default='active')
	required_annual_hours = models.PositiveIntegerField(default=150)

	class Meta:
		ordering = ['student_code']

	def __str__(self) -> str:
		return self.student_code


class TeacherProfile(UUIDTimeStampedModel, ActiveModel):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
	employee_code = models.SlugField(max_length=30, unique=True, null=True, blank=True)

	def __str__(self) -> str:
		return str(self.user)


class DepartmentHeadProfile(UUIDTimeStampedModel, ActiveModel):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='department_head_profile')
	career = models.OneToOneField(Career, on_delete=models.PROTECT, related_name='department_head_profile')

	def __str__(self) -> str:
		return str(self.user)


class Assignment(UUIDTimeStampedModel):
	student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name='assignments')
	subarea = models.ForeignKey(Subarea, on_delete=models.PROTECT, related_name='assignments')
	teacher_profile = models.ForeignKey(TeacherProfile, on_delete=models.PROTECT, related_name='assignments')
	term = models.ForeignKey(Term, on_delete=models.PROTECT, related_name='assignments')
	assigned_at = models.DateTimeField(auto_now_add=True)
	end_at = models.DateTimeField(null=True, blank=True)
	status = models.CharField(max_length=30, default='active')
	notes = models.TextField(blank=True)

	class Meta:
		ordering = ['-assigned_at']
		constraints = [
			models.UniqueConstraint(
				fields=['student', 'term'],
				condition=models.Q(status='active'),
				name='uniq_active_assignment_per_student_term',
			),
		]

	def __str__(self) -> str:
		return f'{self.student} -> {self.teacher_profile}'
