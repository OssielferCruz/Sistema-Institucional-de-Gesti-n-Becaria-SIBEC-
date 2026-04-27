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
from apps.organization.models import Area, Subarea
from apps.scholarships.models import Assignment, DepartmentHeadProfile, Student, TeacherProfile


class Command(BaseCommand):
    help = 'Seed operational demo data (department heads, teachers, students, assignments, and hours logs).'

    DEFAULT_PASSWORD = 'Demo123456!'

    AREA_CATALOG = {
        'asistencia-docente': {
            'name': 'Asistencia Docente',
            'subareas': [
                ('jefatura-ice-iem', 'Jefatura ICE/IEM'),
                ('jefatura-ime', 'Jefatura IME'),
                ('jefatura-ims-iel', 'Jefatura IMS/IEL'),
                ('jefatura-igi', 'Jefatura IGI'),
                ('jefatura-lcm-laf', 'Jefatura LCM/LAF'),
            ],
        },
        'biblioteca': {
            'name': 'Biblioteca',
            'subareas': [('biblioteca-general', 'Biblioteca General')],
        },
        'bienestar-estudiantil': {
            'name': 'Bienestar Estudiantil',
            'subareas': [('danza', 'Danza'), ('futbol', 'Futbol'), ('voleibol', 'Voleibol')],
        },
        'extension-universitaria': {
            'name': 'Extensión Universitaria',
            'subareas': [('extension-coro', 'Coro')],
        },
        'cidtea': {
            'name': 'CIDTEA',
            'subareas': [('cidtea-lab', 'Taller y Laboratorio')],
        },
        'brigada-ambiental': {
            'name': 'Brigada Ambiental',
            'subareas': [('brigada-ambiental-general', 'Brigada Ambiental General')],
        },
        'comunicacion-institucional': {
            'name': 'Comunicación Institucional',
            'subareas': [('comunicacion-prensa', 'Prensa y Contenido')],
        },
        'decanatura': {
            'name': 'Decanatura',
            'subareas': [('decanatura-general', 'Decanatura General')],
        },
        'educacion-distancia': {
            'name': 'Educación a Distancia',
            'subareas': [('ead-soporte', 'Soporte Académico Virtual')],
        },
        'registro-academico': {
            'name': 'Registro Académico',
            'subareas': [('registro-operativo', 'Operación de Registro')],
        },
    }

    DEPARTMENT_HEADS = [
        {'email': 'jefatura.ice@ulsa.edu.ni', 'first_name': 'Laura Patricia', 'last_name': 'Mendoza Rios', 'career_code': 'ice'},
        {'email': 'jefatura.iem@ulsa.edu.ni', 'first_name': 'Rafael Antonio', 'last_name': 'Cruz Silva', 'career_code': 'iem'},
        {'email': 'jefatura.ime@ulsa.edu.ni', 'first_name': 'Patricia Elena', 'last_name': 'Flores Vargas', 'career_code': 'ime'},
        {'email': 'jefatura.ims@ulsa.edu.ni', 'first_name': 'David Eduardo', 'last_name': 'Hernandez Solis', 'career_code': 'ims'},
        {'email': 'jefatura.iel@ulsa.edu.ni', 'first_name': 'Claudia Maria', 'last_name': 'Morales Pineda', 'career_code': 'iel'},
        {'email': 'jefatura.igi@ulsa.edu.ni', 'first_name': 'Monica Sofia', 'last_name': 'Pineda Rivas', 'career_code': 'igi'},
        {'email': 'jefatura.lcm@ulsa.edu.ni', 'first_name': 'Jorge Luis', 'last_name': 'Salas Ruiz', 'career_code': 'lcm'},
        {'email': 'jefatura.laf@ulsa.edu.ni', 'first_name': 'Diana Carolina', 'last_name': 'Campos Soto', 'career_code': 'laf'},
    ]


    TEACHERS = [
        {'email': 'roberto.mendez@ac.ulsa.edu.ni', 'first_name': 'Roberto Carlos', 'last_name': 'Mendez Castro', 'employee_code': 'DOC-001', 'subarea_code': 'jefatura-ice-iem'},
        {'email': 'carolina.lopez@ac.ulsa.edu.ni', 'first_name': 'Carolina Beatriz', 'last_name': 'Lopez Garcia', 'employee_code': 'DOC-002', 'subarea_code': 'jefatura-ime'},
        {'email': 'gabriel.ortega@ac.ulsa.edu.ni', 'first_name': 'Gabriel Alejandro', 'last_name': 'Ortega Salazar', 'employee_code': 'DOC-003', 'subarea_code': 'jefatura-ims-iel'},
        {'email': 'sonia.vargas@ac.ulsa.edu.ni', 'first_name': 'Sonia del Carmen', 'last_name': 'Vargas Lopez', 'employee_code': 'DOC-004', 'subarea_code': 'jefatura-igi'},
        {'email': 'mariana.torres@ac.ulsa.edu.ni', 'first_name': 'Mariana de Jesus', 'last_name': 'Torres Rivas', 'employee_code': 'DOC-005', 'subarea_code': 'jefatura-lcm-laf'},
        {'email': 'ana.martinez@ac.ulsa.edu.ni', 'first_name': 'Ana Leticia', 'last_name': 'Martinez Soto', 'employee_code': 'DOC-006', 'subarea_code': 'biblioteca-general'},
        {'email': 'miguel.torres@ac.ulsa.edu.ni', 'first_name': 'Miguel Angel', 'last_name': 'Torres Vargas', 'employee_code': 'DOC-007', 'subarea_code': 'danza'},
        {'email': 'daniel.castro@ac.ulsa.edu.ni', 'first_name': 'Daniel Enrique', 'last_name': 'Castro Pineda', 'employee_code': 'DOC-008', 'subarea_code': 'futbol'},
        {'email': 'sandra.ortiz@ac.ulsa.edu.ni', 'first_name': 'Sandra Milena', 'last_name': 'Ortiz Silva', 'employee_code': 'DOC-009', 'subarea_code': 'voleibol'},
        {'email': 'jorge.hernandez@ac.ulsa.edu.ni', 'first_name': 'Jorge Luis', 'last_name': 'Hernandez Guzman', 'employee_code': 'DOC-010', 'subarea_code': 'extension-coro'},
        {'email': 'ricardo.guzman@ac.ulsa.edu.ni', 'first_name': 'Ricardo Jose', 'last_name': 'Guzman Rios', 'employee_code': 'DOC-011', 'subarea_code': 'cidtea-lab'},
        {'email': 'mariana.solano@ac.ulsa.edu.ni', 'first_name': 'Mariana Mercedes', 'last_name': 'Solano Flores', 'employee_code': 'DOC-012', 'subarea_code': 'brigada-ambiental-general'},
        {'email': 'raul.espinoza@ac.ulsa.edu.ni', 'first_name': 'Raul Alberto', 'last_name': 'Espinoza Ruiz', 'employee_code': 'DOC-013', 'subarea_code': 'comunicacion-prensa'},
        {'email': 'andres.medina@ac.ulsa.edu.ni', 'first_name': 'Andres Felipe', 'last_name': 'Medina Castro', 'employee_code': 'DOC-014', 'subarea_code': 'decanatura-general'},
        {'email': 'pablo.jimenez@ac.ulsa.edu.ni', 'first_name': 'Pablo Emilio', 'last_name': 'Jimenez Salazar', 'employee_code': 'DOC-015', 'subarea_code': 'ead-soporte'},
        {'email': 'sofia.ruiz@ac.ulsa.edu.ni', 'first_name': 'Sofia Margarita', 'last_name': 'Ruiz Mendoza', 'employee_code': 'DOC-016', 'subarea_code': 'registro-operativo'},
    ]


    STUDENTS = [
        {'email': 'juan.perez@est.ulsa.edu.ni', 'first_name': 'Juan Jose', 'last_name': 'Perez Lopez', 'student_code': 'EST001', 'career_code': 'ice', 'subarea_code': 'jefatura-ice-iem', 'study_plan': 'cuatri'},
        {'email': 'maria.lopez@est.ulsa.edu.ni', 'first_name': 'Maria Elena', 'last_name': 'Lopez Garcia', 'student_code': 'EST002', 'career_code': 'iem', 'subarea_code': 'jefatura-ice-iem', 'study_plan': 'trim'},
        {'email': 'carlos.sanchez@est.ulsa.edu.ni', 'first_name': 'Carlos Alfonso', 'last_name': 'Sanchez Cruz', 'student_code': 'EST003', 'career_code': 'ime', 'subarea_code': 'jefatura-ime', 'study_plan': 'cuatri'},
        {'email': 'andrea.romero@est.ulsa.edu.ni', 'first_name': 'Andrea Sofia', 'last_name': 'Romero Pineda', 'student_code': 'EST004', 'career_code': 'ims', 'subarea_code': 'jefatura-ims-iel', 'study_plan': 'trim'},
        {'email': 'diego.jimenez@est.ulsa.edu.ni', 'first_name': 'Diego Fernando', 'last_name': 'Jimenez Rivas', 'student_code': 'EST005', 'career_code': 'iel', 'subarea_code': 'jefatura-ims-iel', 'study_plan': 'cuatri'},
        {'email': 'sofia.navarro@est.ulsa.edu.ni', 'first_name': 'Sofia Alejandra', 'last_name': 'Navarro Soto', 'student_code': 'EST006', 'career_code': 'igi', 'subarea_code': 'jefatura-igi', 'study_plan': 'trim'},
        {'email': 'valeria.morales@est.ulsa.edu.ni', 'first_name': 'Valeria de los Angeles', 'last_name': 'Morales Vargas', 'student_code': 'EST007', 'career_code': 'lcm', 'subarea_code': 'jefatura-lcm-laf', 'study_plan': 'cuatri'},
        {'email': 'patricia.vazquez@est.ulsa.edu.ni', 'first_name': 'Patricia del Carmen', 'last_name': 'Vazquez Castro', 'student_code': 'EST008', 'career_code': 'laf', 'subarea_code': 'jefatura-lcm-laf', 'study_plan': 'trim'},
        {'email': 'jorge.castillo@est.ulsa.edu.ni', 'first_name': 'Jorge Luis', 'last_name': 'Castillo Mendoza', 'student_code': 'EST009', 'career_code': 'ice', 'subarea_code': 'biblioteca-general', 'study_plan': 'cuatri'},
        {'email': 'gabriela.herrera@est.ulsa.edu.ni', 'first_name': 'Gabriela Patricia', 'last_name': 'Herrera Ruiz', 'student_code': 'EST010', 'career_code': 'laf', 'subarea_code': 'biblioteca-general', 'study_plan': 'trim'},
        {'email': 'armando.ruiz@est.ulsa.edu.ni', 'first_name': 'Armando Jose', 'last_name': 'Ruiz Silva', 'student_code': 'EST011', 'career_code': 'ims', 'subarea_code': 'danza', 'study_plan': 'cuatri'},
        {'email': 'fernanda.salas@est.ulsa.edu.ni', 'first_name': 'Fernanda Victoria', 'last_name': 'Salas Flores', 'student_code': 'EST012', 'career_code': 'iem', 'subarea_code': 'futbol', 'study_plan': 'trim'},
        {'email': 'lucia.luna@est.ulsa.edu.ni', 'first_name': 'Lucia Vanessa', 'last_name': 'Luna Guzman', 'student_code': 'EST013', 'career_code': 'igi', 'subarea_code': 'voleibol', 'study_plan': 'cuatri'},
        {'email': 'ricardo.nunez@est.ulsa.edu.ni', 'first_name': 'Ricardo Antonio', 'last_name': 'Nuñez Rios', 'student_code': 'EST014', 'career_code': 'ime', 'subarea_code': 'danza', 'study_plan': 'trim'},
        {'email': 'ximena.campos@est.ulsa.edu.ni', 'first_name': 'Ximena Isabel', 'last_name': 'Campos Salazar', 'student_code': 'EST015', 'career_code': 'lcm', 'subarea_code': 'futbol', 'study_plan': 'cuatri'},
        {'email': 'ivan.guerrero@est.ulsa.edu.ni', 'first_name': 'Ivan Dario', 'last_name': 'Guerrero Ortiz', 'student_code': 'EST016', 'career_code': 'iel', 'subarea_code': 'voleibol', 'study_plan': 'trim'},
        {'email': 'julian.rojas@est.ulsa.edu.ni', 'first_name': 'Julian Andres', 'last_name': 'Rojas Cruz', 'student_code': 'EST017', 'career_code': 'ice', 'subarea_code': 'extension-coro', 'study_plan': 'cuatri'},
    ]


    def handle(self, *args, **options):
        with transaction.atomic():
            self._validate_prerequisites()
            self._seed_area_catalog()

            role_admin = Role.objects.get(code='admin')
            role_jefatura = Role.objects.get(code='jefatura')
            role_docente = Role.objects.get(code='docente')
            role_estudiante = Role.objects.get(code='estudiante')

            cuatri = StudyPlan.objects.get(code='cuatri')
            trim = StudyPlan.objects.get(code='trim')
            active_term_cuatri = self._get_active_term(cuatri)
            active_term_trim = self._get_active_term(trim)

            teacher_by_subarea = self._seed_teachers(role_docente)
            department_head_by_career = self._seed_department_heads(role_jefatura)
            assignments = self._seed_students_and_assignments(
                role_estudiante,
                cuatri,
                trim,
                active_term_cuatri,
                active_term_trim,
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

    def _seed_area_catalog(self):
        for area_code, area_data in self.AREA_CATALOG.items():
            area, _ = Area.objects.update_or_create(
                code=area_code,
                defaults={
                    'name': area_data['name'],
                    'is_active': True,
                },
            )

            for subarea_code, subarea_name in area_data['subareas']:
                Subarea.objects.update_or_create(
                    area=area,
                    code=subarea_code,
                    defaults={
                        'name': subarea_name,
                        'is_active': True,
                    },
                )

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
        cuatri: StudyPlan,
        trim: StudyPlan,
        active_term_cuatri: Term,
        active_term_trim: Term,
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
                                        'study_plan': trim if payload.get('study_plan') == 'trim' else cuatri,
                    'admission_year': current_year - 1,
                    'scholarship_status': 'active',
                    'required_annual_hours': 150,
                    'is_active': True,
                },
            )

            term_to_use = active_term_trim if payload.get('study_plan') == 'trim' else active_term_cuatri
            assignment = Assignment.objects.filter(student=student, term=term_to_use, status='active').first()
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
                    term=term_to_use,
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
