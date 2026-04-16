from django.db import models

from apps.common.models import ActiveModel, UUIDTimeStampedModel


class Area(UUIDTimeStampedModel, ActiveModel):
	code = models.SlugField(max_length=30, unique=True)
	name = models.CharField(max_length=120, unique=True)
	description = models.TextField(blank=True)

	class Meta:
		ordering = ['name']

	def __str__(self) -> str:
		return self.name


class Subarea(UUIDTimeStampedModel, ActiveModel):
	area = models.ForeignKey(Area, on_delete=models.PROTECT, related_name='subareas')
	code = models.SlugField(max_length=30)
	name = models.CharField(max_length=150)
	description = models.TextField(blank=True)

	class Meta:
		ordering = ['area__name', 'name']
		constraints = [
			models.UniqueConstraint(fields=['area', 'code'], name='uniq_subarea_code_per_area'),
			models.UniqueConstraint(fields=['area', 'name'], name='uniq_subarea_name_per_area'),
		]

	def __str__(self) -> str:
		return f'{self.area.name} - {self.name}'
