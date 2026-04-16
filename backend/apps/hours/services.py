from decimal import Decimal

from django.db.models import Sum

from apps.hours.models import HoursLog, HoursPolicy
from apps.scholarships.models import Student


def get_active_policy():
    return HoursPolicy.objects.prefetch_related('segments', 'segments__study_plan').filter(is_active=True).order_by('-version').first()


def get_student_progress(student: Student):
    approved_hours = (
        HoursLog.objects.filter(student=student, status='approved')
        .aggregate(total=Sum('reported_hours'))
        .get('total')
        or Decimal('0')
    )

    policy = get_active_policy()
    annual_target = student.required_annual_hours
    current_target = annual_target
    period_sequence = None
    policy_name = None

    if policy:
        annual_target = policy.annual_target_hours
        policy_name = policy.name
        segment = policy.segments.filter(study_plan=student.study_plan).order_by('period_sequence').first()
        if segment:
            current_target = segment.target_hours
            period_sequence = segment.period_sequence
        else:
            current_target = annual_target

    remaining = max(Decimal(current_target) - approved_hours, Decimal('0'))

    return {
        'student_id': str(student.id),
        'student_code': student.student_code,
        'student_name': str(student.user),
        'study_plan': student.study_plan.name,
        'career': student.career.name,
        'approved_hours': approved_hours,
        'target_hours': Decimal(current_target),
        'remaining_hours': remaining,
        'policy_name': policy_name,
        'period_sequence': period_sequence,
        'annual_target_hours': Decimal(annual_target),
    }
