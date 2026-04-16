import csv
import secrets
from io import TextIOWrapper

from django.db import transaction
from django.utils.text import slugify

from apps.academic.models import Career, StudyPlan
from apps.accounts.models import Role, User
from apps.scholarships.models import Student


REQUIRED_IMPORT_HEADERS = {
    'student_code',
    'first_name',
    'last_name',
    'email',
    'career_code',
    'study_plan_code',
    'admission_year',
}


def _normalize_row(raw_row: dict) -> dict:
    return {str(k).strip(): (str(v).strip() if v is not None else '') for k, v in raw_row.items()}


def import_students_from_csv(file_obj):
    wrapped = TextIOWrapper(file_obj, encoding='utf-8-sig')
    reader = csv.DictReader(wrapped)

    if not reader.fieldnames:
        return {
            'processed': 0,
            'created': 0,
            'errors': [{'row': 0, 'detail': 'The uploaded file has no headers.'}],
        }

    present_headers = {h.strip() for h in reader.fieldnames}
    missing_headers = sorted(REQUIRED_IMPORT_HEADERS - present_headers)
    if missing_headers:
        return {
            'processed': 0,
            'created': 0,
            'errors': [{'row': 0, 'detail': f'Missing headers: {", ".join(missing_headers)}'}],
        }

    try:
        student_role = Role.objects.get(code='estudiante')
    except Role.DoesNotExist:
        return {
            'processed': 0,
            'created': 0,
            'errors': [{'row': 0, 'detail': "Role 'estudiante' does not exist. Run seed data first."}],
        }

    processed = 0
    created = 0
    errors = []

    for idx, raw_row in enumerate(reader, start=2):
        processed += 1
        row = _normalize_row(raw_row)
        try:
            student_code = slugify(row['student_code'])
            email = row['email'].lower()
            first_name = row['first_name']
            last_name = row['last_name']
            career_code = slugify(row['career_code'])
            plan_code = slugify(row['study_plan_code'])
            admission_year = int(row['admission_year'])
            required_annual_hours = int(row.get('required_annual_hours') or 150)

            if not student_code or not email or not first_name or not last_name:
                raise ValueError('student_code, email, first_name and last_name are required.')

            if Student.objects.filter(student_code=student_code).exists():
                raise ValueError(f'Student code already exists: {student_code}')
            if User.objects.filter(email=email).exists():
                raise ValueError(f'Email already exists: {email}')

            career = Career.objects.get(code=career_code)
            study_plan = StudyPlan.objects.get(code=plan_code)

            with transaction.atomic():
                user = User.objects.create_user(
                    email=email,
                    password=secrets.token_urlsafe(10),
                    first_name=first_name,
                    last_name=last_name,
                    role=student_role,
                )
                Student.objects.create(
                    user=user,
                    student_code=student_code,
                    career=career,
                    study_plan=study_plan,
                    admission_year=admission_year,
                    required_annual_hours=required_annual_hours,
                )
            created += 1
        except Career.DoesNotExist:
            errors.append({'row': idx, 'detail': f"Career code not found: {row.get('career_code', '')}"})
        except StudyPlan.DoesNotExist:
            errors.append({'row': idx, 'detail': f"Study plan code not found: {row.get('study_plan_code', '')}"})
        except Exception as exc:
            errors.append({'row': idx, 'detail': str(exc)})

    return {
        'processed': processed,
        'created': created,
        'errors': errors,
    }
