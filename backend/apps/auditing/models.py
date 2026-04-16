from django.db import models

from apps.accounts.models import User
from apps.common.models import UUIDTimeStampedModel


class AuditEvent(UUIDTimeStampedModel):
	actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_events')
	event_type = models.CharField(max_length=80)
	entity_name = models.CharField(max_length=80)
	entity_id = models.UUIDField()
	before_data = models.JSONField(null=True, blank=True)
	after_data = models.JSONField(null=True, blank=True)
	ip_address = models.CharField(max_length=64, null=True, blank=True)
	user_agent = models.CharField(max_length=255, null=True, blank=True)

