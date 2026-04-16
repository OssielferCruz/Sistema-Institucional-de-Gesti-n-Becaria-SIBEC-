from django.db import models

from apps.common.models import ActiveModel, UUIDTimeStampedModel


class Career(UUIDTimeStampedModel, ActiveModel):
	code = models.SlugField(max_length=30, unique=True)
	name = models.CharField(max_length=150, unique=True)

	class Meta:
		ordering = ['name']

	def __str__(self) -> str:
		return self.name


class StudyPlan(UUIDTimeStampedModel, ActiveModel):
	code = models.SlugField(max_length=30, unique=True)
	name = models.CharField(max_length=100)
	period_type = models.CharField(max_length=20)
	periods_per_year = models.PositiveSmallIntegerField()

	class Meta:
		ordering = ['name']

	def __str__(self) -> str:
		return self.name


class Term(UUIDTimeStampedModel):
	academic_year = models.PositiveSmallIntegerField()
	study_plan = models.ForeignKey(StudyPlan, on_delete=models.PROTECT, related_name='terms')
	sequence_number = models.PositiveSmallIntegerField()
	name = models.CharField(max_length=100)
	start_date = models.DateField()
	end_date = models.DateField()
	is_closed = models.BooleanField(default=False)

	class Meta:
		ordering = ['-academic_year', 'sequence_number']
		constraints = [
			models.UniqueConstraint(
				fields=['academic_year', 'study_plan', 'sequence_number'],
				name='uniq_academic_term_per_plan_sequence',
			),
			models.CheckConstraint(condition=models.Q(start_date__lte=models.F('end_date')), name='term_dates_valid'),
		]

	def __str__(self) -> str:
		return self.name
