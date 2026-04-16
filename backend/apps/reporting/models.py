from django.db import models

from apps.common.models import UUIDTimeStampedModel
from apps.scholarships.models import DepartmentHeadProfile
from apps.academic.models import Term


class WeeklyReport(UUIDTimeStampedModel):
	department_head = models.ForeignKey(DepartmentHeadProfile, on_delete=models.PROTECT, related_name='weekly_reports')
	term = models.ForeignKey(Term, on_delete=models.PROTECT, related_name='weekly_reports')
	week_start = models.DateField()
	week_end = models.DateField()
	summary = models.TextField()
	status = models.CharField(max_length=20, default='draft')
	sent_at = models.DateTimeField(null=True, blank=True)

