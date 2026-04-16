from django.db import models

from apps.accounts.models import User
from apps.common.models import UUIDTimeStampedModel
from apps.hours.models import HoursLog
from apps.scholarships.models import DepartmentHeadProfile


class HoursReview(UUIDTimeStampedModel):
	hours_log = models.OneToOneField(HoursLog, on_delete=models.CASCADE, related_name='review')
	reviewer = models.ForeignKey(DepartmentHeadProfile, on_delete=models.PROTECT, related_name='reviews')
	decision = models.CharField(max_length=20)
	comments = models.TextField(blank=True)
	reviewed_at = models.DateTimeField(auto_now_add=True)

