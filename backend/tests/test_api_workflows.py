from datetime import date, time
from decimal import Decimal

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.academic.models import Career, StudyPlan, Term
from apps.accounts.models import Role, User
from apps.hours.models import HoursLog
from apps.organization.models import Area, Subarea
from apps.scholarships.models import Assignment, DepartmentHeadProfile, Student, TeacherProfile


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def roles(db):
    return {
        'admin': Role.objects.create(code='admin', name='Administrador'),
        'jefatura': Role.objects.create(code='jefatura', name='Jefatura'),
        'docente': Role.objects.create(code='docente', name='Docente'),
        'estudiante': Role.objects.create(code='estudiante', name='Estudiante'),
    }


def create_user(email, role, first_name='User', last_name='Test'):
    return User.objects.create_user(
        email=email,
        password='Test123456!',
        first_name=first_name,
        last_name=last_name,
        role=role,
    )


@pytest.fixture
def academic_base(db):
    career_ice = Career.objects.create(code='ice', name='Ingenieria Civil')
    career_igi = Career.objects.create(code='igi', name='Ingenieria en Gestion Industrial')
    plan = StudyPlan.objects.create(code='cuatri', name='Cuatrimestral', period_type='cuatrimestre', periods_per_year=3)
    term = Term.objects.create(
        academic_year=2026,
        study_plan=plan,
        sequence_number=1,
        name='Cuatrimestre 1 2026',
        start_date=date(2026, 1, 1),
        end_date=date(2026, 4, 30),
    )
    area = Area.objects.create(code='asistencia-docente', name='Asistencia Docente')
    subarea = Subarea.objects.create(area=area, code='jefatura-ice-iem', name='Jefatura ICE/IEM')
    return {
        'career_ice': career_ice,
        'career_igi': career_igi,
        'plan': plan,
        'term': term,
        'subarea': subarea,
    }


@pytest.fixture
def base_people(db, roles, academic_base):
    admin = create_user('admin@test.local', roles['admin'], 'Admin', 'SIBEC')

    teacher_user_1 = create_user('teacher1@test.local', roles['docente'], 'Docente', 'Uno')
    teacher_user_2 = create_user('teacher2@test.local', roles['docente'], 'Docente', 'Dos')
    teacher_1 = TeacherProfile.objects.create(user=teacher_user_1, employee_code='DOC-001')
    teacher_2 = TeacherProfile.objects.create(user=teacher_user_2, employee_code='DOC-002')

    student_user = create_user('student@test.local', roles['estudiante'], 'Estudiante', 'Uno')
    student = Student.objects.create(
        user=student_user,
        student_code='ULSA-001',
        career=academic_base['career_ice'],
        study_plan=academic_base['plan'],
        admission_year=2026,
        required_annual_hours=150,
    )

    assignment = Assignment.objects.create(
        student=student,
        subarea=academic_base['subarea'],
        teacher_profile=teacher_1,
        term=academic_base['term'],
        status='active',
    )

    head_ok_user = create_user('head1@test.local', roles['jefatura'], 'Jefe', 'ICE')
    head_other_user = create_user('head2@test.local', roles['jefatura'], 'Jefe', 'IGI')
    DepartmentHeadProfile.objects.create(user=head_ok_user, career=academic_base['career_ice'])
    DepartmentHeadProfile.objects.create(user=head_other_user, career=academic_base['career_igi'])

    return {
        'admin': admin,
        'teacher_user_1': teacher_user_1,
        'teacher_user_2': teacher_user_2,
        'teacher_1': teacher_1,
        'teacher_2': teacher_2,
        'student_user': student_user,
        'student': student,
        'assignment': assignment,
        'head_ok_user': head_ok_user,
        'head_other_user': head_other_user,
    }


@pytest.mark.django_db
def test_roles_endpoint_requires_admin(api_client, roles):
    admin = create_user('admin-role@test.local', roles['admin'])
    teacher = create_user('teacher-role@test.local', roles['docente'])

    api_client.force_authenticate(user=admin)
    assert api_client.get('/api/v1/roles/').status_code == 200

    api_client.force_authenticate(user=teacher)
    assert api_client.get('/api/v1/roles/').status_code == 403


@pytest.mark.django_db
def test_student_import_csv_admin_only(api_client, roles, academic_base):
    admin = create_user('admin-import@test.local', roles['admin'])
    teacher = create_user('teacher-import@test.local', roles['docente'])

    csv_content = (
        'student_code,first_name,last_name,email,career_code,study_plan_code,admission_year,required_annual_hours\n'
        'ULSA-100,Ana,Ruiz,ana.ruiz@example.com,ice,cuatri,2026,150\n'
    )
    upload_forbidden = SimpleUploadedFile('students.csv', csv_content.encode('utf-8'), content_type='text/csv')
    upload_created = SimpleUploadedFile('students.csv', csv_content.encode('utf-8'), content_type='text/csv')

    api_client.force_authenticate(user=teacher)
    response_forbidden = api_client.post('/api/v1/students/import_csv/', {'file': upload_forbidden}, format='multipart')
    assert response_forbidden.status_code == 403

    api_client.force_authenticate(user=admin)
    response_created = api_client.post('/api/v1/students/import_csv/', {'file': upload_created}, format='multipart')
    assert response_created.status_code == 201
    assert response_created.data['created'] == 1


@pytest.mark.django_db
def test_teacher_cannot_register_hours_for_other_teacher_assignment(api_client, base_people, academic_base):
    api_client.force_authenticate(user=base_people['teacher_user_2'])
    payload = {
        'student': str(base_people['student'].id),
        'assignment': str(base_people['assignment'].id),
        'teacher_profile': str(base_people['teacher_2'].id),
        'term': str(academic_base['term'].id),
        'work_date': '2026-02-10',
        'start_time': '08:00:00',
        'end_time': '10:00:00',
        'reported_hours': '2.00',
        'description': 'Support session',
    }

    response = api_client.post('/api/v1/hours-logs/', payload, format='json')
    assert response.status_code == 400
    assert 'teacher_profile' in response.data


@pytest.mark.django_db
def test_department_head_cannot_approve_other_career_log(api_client, base_people, academic_base):
    hours_log = HoursLog.objects.create(
        student=base_people['student'],
        assignment=base_people['assignment'],
        teacher_profile=base_people['teacher_1'],
        term=academic_base['term'],
        work_date=date(2026, 2, 10),
        start_time=time(8, 0),
        end_time=time(10, 0),
        reported_hours=Decimal('2.00'),
        description='Initial record',
        status='registered',
    )

    api_client.force_authenticate(user=base_people['head_other_user'])
    response = api_client.post(f'/api/v1/hours-logs/{hours_log.id}/approve/', {'comments': 'Out of scope'}, format='json')
    assert response.status_code == 404


@pytest.mark.django_db
def test_student_progress_me_returns_approved_hours(api_client, base_people, academic_base):
    HoursLog.objects.create(
        student=base_people['student'],
        assignment=base_people['assignment'],
        teacher_profile=base_people['teacher_1'],
        term=academic_base['term'],
        work_date=date(2026, 2, 10),
        start_time=time(8, 0),
        end_time=time(10, 0),
        reported_hours=Decimal('2.00'),
        description='Approved record',
        status='approved',
    )

    api_client.force_authenticate(user=base_people['student_user'])
    response = api_client.get('/api/v1/progress/me/')
    assert response.status_code == 200
    assert Decimal(str(response.data['approved_hours'])) == Decimal('2.00')


@pytest.mark.django_db
def test_healthcheck_is_public_and_reports_ok(api_client):
    response = api_client.get('/healthz/')
    assert response.status_code == 200
    assert response.data['status'] == 'ok'
    assert response.data['database'] == 'up'
