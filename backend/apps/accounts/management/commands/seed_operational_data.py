from __future__ import annotations

from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.academic.models import Career, StudyPlan, Term
from apps.accounts.models import Role, User
from apps.approvals.models import HoursReview
from apps.hours.models import HoursLog, HoursPolicy, HoursPolicySegment
from apps.organization.models import Subarea
from apps.scholarships.models import Assignment, DepartmentHeadProfile, Student, TeacherProfile


class Command(BaseCommand):
    help = 'Seed operational demo data (department heads, teachers, students, assignments, and hours logs).'

    DEFAULT_PASSWORD = 'Demo123456!'

    DEPARTMENT_HEADS = [
        {
            'email': 'jefatura.ice@sibec.local',
            'first_name': 'Laura',
            'last_name': 'Mendoza',
            'career_code': 'ice',
        },
        {
            'email': 'jefatura.iem@sibec.local',
            'first_name': 'Rafael',
            'last_name': 'Cruz',
            'career_code': 'iem',
        },
        {
            'email': 'jefatura.ime@sibec.local',
            'first_name': 'Patricia',
            'last_name': 'Flores',
            'career_code': 'ime',
        },
        {
            'email': 'jefatura.ims@sibec.local',
            'first_name': 'David',
            'last_name': 'Hernandez',
            'career_code': 'ims',
        },
        {
            'email': 'jefatura.iel@sibec.local',
            'first_name': 'Claudia',
            'last_name': 'Morales',
            'career_code': 'iel',
        },
        {
            'email': 'jefatura.igi@sibec.local',
            'first_name': 'Monica',
            'last_name': 'Pineda',
            'career_code': 'igi',
        },
        {
            'email': 'jefatura.lcm@sibec.local',
            'first_name': 'Jorge',
            'last_name': 'Salas',
            'career_code': 'lcm',
        },
        {
            'email': 'jefatura.laf@sibec.local',
            'first_name': 'Diana',
            'last_name': 'Campos',
            'career_code': 'laf',
        },
    ]

    TEACHERS = [
        {
            'email': 'docente.iceiem@sibec.local',
            'first_name': 'Roberto',
            'last_name': 'Mendez',
            'employee_code': 'DOC-001',
            'subarea_code': 'jefatura-ice-iem',
        },
        {
            'email': 'docente.ime@sibec.local',
            'first_name': 'Carolina',
            'last_name': 'Lopez',
            'employee_code': 'DOC-002',
            'subarea_code': 'jefatura-ime',
        },
        {
            'email': 'docente.imsiel@sibec.local',
            'first_name': 'Gabriel',
            'last_name': 'Ortega',
            'employee_code': 'DOC-003',
            'subarea_code': 'jefatura-ims-iel',
        },
        {
            'email': 'docente.igi@sibec.local',
            'first_name': 'Sonia',
            'last_name': 'Vargas',
            'employee_code': 'DOC-004',
            'subarea_code': 'jefatura-igi',
        },
        {
            'email': 'docente.lcmlaf@sibec.local',
            'first_name': 'Mariana',
            'last_name': 'Torres',
            'employee_code': 'DOC-005',
            'subarea_code': 'jefatura-lcm-laf',
        },
        {
            'email': 'docente.biblioteca@sibec.local',
            'first_name': 'Ana',
            'last_name': 'Martinez',
            'employee_code': 'DOC-006',
            'subarea_code': 'biblioteca-general',
        },
        {
            'email': 'docente.danza@sibec.local',
            'first_name': 'Miguel',
            'last_name': 'Torres',
            'employee_code': 'DOC-007',
            'subarea_code': 'danza',
        },
        {
            'email': 'docente.futbol@sibec.local',
            'first_name': 'Daniel',
            'last_name': 'Castro',
            'employee_code': 'DOC-008',
            'subarea_code': 'futbol',
        },
        {
            'email': 'docente.voleibol@sibec.local',
            'first_name': 'Sandra',
            'last_name': 'Ortiz',
            'employee_code': 'DOC-009',
            'subarea_code': 'voleibol',
        },
    ]

    STUDENTS = [
        {
            'email': 'estudiante.001@sibec.local',
            'first_name': 'Juan',
            'last_name': 'Perez',
            'student_code': 'EST001',
            'career_code': 'ice',
            'subarea_code': 'jefatura-ice-iem',
        },
        {
            'email': 'estudiante.002@sibec.local',
            'first_name': 'Maria',
            'last_name': 'Lopez',
            'student_code': 'EST002',
            'career_code': 'iem',
            'subarea_code': 'jefatura-ice-iem',
        },
        {
            'email': 'estudiante.003@sibec.local',
            'first_name': 'Carlos',
            'last_name': 'Sanchez',
            'student_code': 'EST003',
            'career_code': 'ime',
            'subarea_code': 'jefatura-ime',
        },
        {
            'email': 'estudiante.004@sibec.local',
            'first_name': 'Andrea',
            'last_name': 'Romero',
            'student_code': 'EST004',
            'career_code': 'ims',
            'subarea_code': 'jefatura-ims-iel',
        },
        {
            'email': 'estudiante.005@sibec.local',
            'first_name': 'Diego',
            'last_name': 'Jimenez',
            'student_code': 'EST005',
            'career_code': 'iel',
            'subarea_code': 'jefatura-ims-iel',
        },
        {
            'email': 'estudiante.006@sibec.local',
            'first_name': 'Sofia',
            'last_name': 'Navarro',
            'student_code': 'EST006',
            'career_code': 'igi',
            'subarea_code': 'jefatura-igi',
        },
        {
            'email': 'estudiante.007@sibec.local',
            'first_name': 'Valeria',
            'last_name': 'Morales',
            'student_code': 'EST007',
            'career_code': 'lcm',
            'subarea_code': 'jefatura-lcm-laf',
        },
        {
            'email': 'estudiante.008@sibec.local',
            'first_name': 'Patricia',
            'last_name': 'Vazquez',
            'student_code': 'EST008',
            'career_code': 'laf',
            'subarea_code': 'jefatura-lcm-laf',
        },
        {
            'email': 'estudiante.009@sibec.local',
            'first_name': 'Jorge',
            'last_name': 'Castillo',
            'student_code': 'EST009',
            'career_code': 'ice',
            'subarea_code': 'biblioteca-general',
        },
        {
            'email': 'estudiante.010@sibec.local',
            'first_name': 'Gabriela',
            'last_name': 'Herrera',
            'student_code': 'EST010',
            'career_code': 'laf',
            'subarea_code': 'biblioteca-general',
        },
        {
            'email': 'estudiante.011@sibec.local',
            'first_name': 'Armando',
            'last_name': 'Ruiz',
            'student_code': 'EST011',
            'career_code': 'ims',
            'subarea_code': 'danza',
        },
        {
            'email': 'estudiante.012@sibec.local',
            'first_name': 'Fernanda',
            'last_name': 'Salas',
            'student_code': 'EST012',
            'career_code': 'iem',
            'subarea_code': 'futbol',
        },
        {
            'email': 'estudiante.013@sibec.local',
            'first_name': 'Lucia',
            'last_name': 'Luna',
            'student_code': 'EST013',
            'career_code': 'igi',
            'subarea_code': 'voleibol',
        },
        {
            'email': 'estudiante.014@sibec.local',
            'first_name': 'Ricardo',
            'last_name': 'Nuñez',
            'student_code': 'EST014',
            'career_code': 'ime',
            'subarea_code': 'danza',
        },
        {
            'email': 'estudiante.015@sibec.local',
            'first_name': 'Ximena',
            'last_name': 'Campos',
            'student_code': 'EST015',
            'career_code': 'lcm',
            'subarea_code': 'futbol',
        },
        {
            'email': 'estudiante.016@sibec.local',
            'first_name': 'Ivan',
            'last_name': 'Guerrero',
            'student_code': 'EST016',
            'career_code': 'iel',
            'subarea_code': 'voleibol',
        },
    ]

    def handle(self, *args, **options):
        with transaction.atomic():
            self._validate_prerequisites()

            role_admin = Role.objects.get(code='admin')
            role_jefatura = Role.objects.get(code='jefatura')
            role_docente = Role.objects.get(code='docente')
            role_estudiante = Role.objects.get(code='estudiante')

            study_plan = StudyPlan.objects.get(code='cuatri')
            active_term = self._get_active_term(study_plan)

            teacher_by_subarea = self._seed_teachers(role_docente)
            department_head_by_career = self._seed_department_heads(role_jefatura)
            assignments = self._seed_students_and_assignments(
                role_estudiante,
                study_plan,
                active_term,
                teacher_by_subarea,
            )

            self._seed_policy(role_admin)
            logs_count = self._seed_hours_logs(assignments, department_head_by_career)

            self.stdout.write(self.style.SUCCESS('Operational seed completed successfully.'))
            self.stdout.write(f'Default password for generated users: {self.DEFAULT_PASSWORD}')
            self.stdout.write(f'Department heads: {DepartmentHeadProfile.objects.count()}')
            self.stdout.write(f'Teachers: {TeacherProfile.objects.count()}')
            self.stdout.write(f'Students: {Student.objects.count()}')
            self.stdout.write(f'Assignments (active): {Assignment.objects.filter(status="active").count()}')
            self.stdout.write(f'Hours logs: {logs_count}')

    def _validate_prerequisites(self):
        missing_roles = [code for code in ['admin', 'jefatura', 'docente', 'estudiante'] if not Role.objects.filter(code=code).exists()]
        if missing_roles:
            raise CommandError(
                'Missing roles: ' + ', '.join(missing_roles) + '. Run seed_initial_data first.'
            )

        if not StudyPlan.objects.filter(code='cuatri').exists():
            raise CommandError('Study plan "cuatri" not found. Run seed_initial_data first.')

        if not Subarea.objects.exists():
            raise CommandError('Subareas not found. Run seed_initial_data first.')

    def _get_active_term(self, study_plan: StudyPlan) -> Term:
        today = date.today()
        term = (
            Term.objects.filter(study_plan=study_plan, is_closed=False, start_date__lte=today, end_date__gte=today)
            .order_by('sequence_number')
            .first()
        )
        if term:
            return term

        fallback = Term.objects.filter(study_plan=study_plan, is_closed=False).order_by('-academic_year', '-sequence_number').first()
        if fallback:
            return fallback

        raise CommandError('No active/open term found for cuatri study plan. Run seed_initial_data first.')

    def _upsert_user(self, email: str, first_name: str, last_name: str, role: Role) -> User:
        user, created = User.objects.update_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': role,
                'is_active': True,
            },
        )
        if created:
            user.set_password(self.DEFAULT_PASSWORD)
            user.save(update_fields=['password'])
        return user

    def _seed_department_heads(self, role_jefatura: Role) -> dict[str, DepartmentHeadProfile]:
        result: dict[str, DepartmentHeadProfile] = {}

        for payload in self.DEPARTMENT_HEADS:
            career = Career.objects.get(code=payload['career_code'])
            user = self._upsert_user(
                email=payload['email'],
                first_name=payload['first_name'],
                last_name=payload['last_name'],
                role=role_jefatura,
            )

            profile, _ = DepartmentHeadProfile.objects.update_or_create(
                career=career,
                defaults={
                    'user': user,
                    'is_active': True,
                },
            )
            result[career.code] = profile

        return result

    def _seed_teachers(self, role_docente: Role) -> dict[str, TeacherProfile]:
        result: dict[str, TeacherProfile] = {}

        for payload in self.TEACHERS:
            user = self._upsert_user(
                email=payload['email'],
                first_name=payload['first_name'],
                last_name=payload['last_name'],
                role=role_docente,
            )

            profile, _ = TeacherProfile.objects.update_or_create(
                user=user,
                defaults={
                    'employee_code': payload['employee_code'],
                    'is_active': True,
                },
            )
            result[payload['subarea_code']] = profile

        return result

    def _seed_students_and_assignments(
        self,
        role_estudiante: Role,
        study_plan: StudyPlan,
        term: Term,
        teacher_by_subarea: dict[str, TeacherProfile],
    ) -> list[Assignment]:
        assignments: list[Assignment] = []
        current_year = date.today().year

        for payload in self.STUDENTS:
            career = Career.objects.get(code=payload['career_code'])
            subarea = Subarea.objects.select_related('area').get(code=payload['subarea_code'])
            teacher_profile = teacher_by_subarea[payload['subarea_code']]

            user = self._upsert_user(
                email=payload['email'],
                first_name=payload['first_name'],
                last_name=payload['last_name'],
                role=role_estudiante,
            )

            student, _ = Student.objects.update_or_create(
                student_code=payload['student_code'],
                defaults={
                    'user': user,
                    'career': career,
                    'study_plan': study_plan,
                    'admission_year': current_year - 1,
                    'scholarship_status': 'active',
                    'required_annual_hours': 150,
                    'is_active': True,
                },
            )

            assignment = Assignment.objects.filter(student=student, term=term, status='active').first()
            if assignment:
                assignment.subarea = subarea
                assignment.teacher_profile = teacher_profile
                assignment.notes = f'Asignacion operativa para {subarea.name}'
                assignment.save(update_fields=['subarea', 'teacher_profile', 'notes', 'updated_at'])
            else:
                assignment = Assignment.objects.create(
                    student=student,
                    subarea=subarea,
                    teacher_profile=teacher_profile,
                    term=term,
                    status='active',
                    notes=f'Asignacion operativa para {subarea.name}',
                )

            assignments.append(assignment)

        return assignments

    def _seed_policy(self, role_admin: Role):
        admin_user = User.objects.filter(role=role_admin).order_by('created_at').first()
        if not admin_user:
            raise CommandError('No admin user found to attach as policy creator.')

        HoursPolicy.objects.filter(is_active=True).update(is_active=False)
        policy, _ = HoursPolicy.objects.update_or_create(
            name='Politica General SIBEC',
            version=1,
            defaults={
                'annual_target_hours': 150,
                'is_active': True,
                'valid_from': date(date.today().year, 1, 1),
                'valid_to': None,
                'description': 'Politica operativa para seguimiento de horas sociales.',
                'created_by': admin_user,
            },
        )

        for plan in StudyPlan.objects.filter(code__in=['cuatri', 'trim']):
            periods = plan.periods_per_year
            if periods == 0:
                continue

            target = max(1, 150 // periods)
            for sequence in range(1, periods + 1):
                HoursPolicySegment.objects.update_or_create(
                    policy=policy,
                    study_plan=plan,
                    period_sequence=sequence,
                    defaults={'target_hours': target},
                )

    def _seed_hours_logs(
        self,
        assignments: list[Assignment],
        department_head_by_career: dict[str, DepartmentHeadProfile],
    ) -> int:
        now = timezone.now()
        created_or_updated = 0

        for index, assignment in enumerate(assignments):
            day = date.today() - timedelta(days=(index % 7) + 1)
            blocks = [
                {
                    'start': time(hour=8, minute=0),
                    'end': time(hour=10, minute=0),
                    'hours': Decimal('2.00'),
                    'status': 'approved',
                    'description': 'Apoyo en actividades operativas del area.',
                },
                {
                    'start': time(hour=10, minute=30),
                    'end': time(hour=12, minute=0),
                    'hours': Decimal('1.50'),
                    'status': 'registered',
                    'description': 'Seguimiento administrativo y reportes de avance.',
                },
                {
                    'start': time(hour=12, minute=30),
                    'end': time(hour=14, minute=0),
                    'hours': Decimal('1.50'),
                    'status': 'rejected',
                    'description': 'Actividad no alineada con lineamientos de evidencia.',
                },
            ]

            for offset, block in enumerate(blocks):
                work_day = day - timedelta(days=offset)
                log, _ = HoursLog.objects.update_or_create(
                    student=assignment.student,
                    assignment=assignment,
                    teacher_profile=assignment.teacher_profile,
                    term=assignment.term,
                    work_date=work_day,
                    start_time=block['start'],
                    defaults={
                        'end_time': block['end'],
                        'reported_hours': block['hours'],
                        'description': block['description'],
                        'status': block['status'],
                        'locked_at': now if block['status'] in ['approved', 'rejected'] else None,
                    },
                )
                created_or_updated += 1

                if block['status'] in ['approved', 'rejected']:
                    reviewer = department_head_by_career.get(assignment.student.career.code)
                    if reviewer:
                        HoursReview.objects.update_or_create(
                            hours_log=log,
                            defaults={
                                'reviewer': reviewer,
                                'decision': block['status'],
                                'comments': 'Revision automatica de datos demo operativos.',
                                'reviewed_at': datetime.combine(work_day, time(15, 0, 0), tzinfo=timezone.get_current_timezone()),
                            },
                        )

        return created_or_updated
