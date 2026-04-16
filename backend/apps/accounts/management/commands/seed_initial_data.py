from datetime import date

from django.core.management.base import BaseCommand

from apps.academic.models import Career, StudyPlan, Term
from apps.accounts.models import Role, User
from apps.organization.models import Area, Subarea


class Command(BaseCommand):
    help = 'Seed initial roles, catalogs, and demo admin user for SIBEC.'

    def handle(self, *args, **options):
        self._seed_roles()
        self._seed_careers()
        self._seed_study_plans_and_terms()
        self._seed_areas_and_subareas()
        self._seed_demo_admin()
        self.stdout.write(self.style.SUCCESS('Seed completed successfully.'))

    def _seed_roles(self):
        roles = [
            ('admin', 'Administrador'),
            ('jefatura', 'Jefatura'),
            ('docente', 'Docente'),
            ('estudiante', 'Estudiante'),
        ]
        for code, name in roles:
            Role.objects.update_or_create(code=code, defaults={'name': name, 'is_active': True})

    def _seed_careers(self):
        careers = [
            ('ice', 'Ingenieria Civil'),
            ('iem', 'Ingenieria Electromecanica'),
            ('ime', 'Ingenieria Mecanica'),
            ('ims', 'Ingenieria en Sistemas'),
            ('iel', 'Ingenieria Electronica'),
            ('igi', 'Ingenieria en Gestion Industrial'),
            ('lcm', 'Licenciatura en Ciencias de la Computacion'),
            ('laf', 'Licenciatura en Administracion y Finanzas'),
        ]
        for code, name in careers:
            Career.objects.update_or_create(code=code, defaults={'name': name, 'is_active': True})

    def _seed_study_plans_and_terms(self):
        today = date.today()
        current_year = today.year

        cuatri, _ = StudyPlan.objects.update_or_create(
            code='cuatri',
            defaults={'name': 'Cuatrimestral', 'period_type': 'cuatrimestre', 'periods_per_year': 3, 'is_active': True},
        )
        trim, _ = StudyPlan.objects.update_or_create(
            code='trim',
            defaults={'name': 'Trimestral', 'period_type': 'trimestre', 'periods_per_year': 4, 'is_active': True},
        )

        cuatri_ranges = [
            (1, date(current_year, 1, 1), date(current_year, 4, 30)),
            (2, date(current_year, 5, 1), date(current_year, 8, 31)),
            (3, date(current_year, 9, 1), date(current_year, 12, 31)),
        ]
        trim_ranges = [
            (1, date(current_year, 1, 1), date(current_year, 3, 31)),
            (2, date(current_year, 4, 1), date(current_year, 6, 30)),
            (3, date(current_year, 7, 1), date(current_year, 9, 30)),
            (4, date(current_year, 10, 1), date(current_year, 12, 31)),
        ]

        for seq, start, end in cuatri_ranges:
            Term.objects.update_or_create(
                academic_year=current_year,
                study_plan=cuatri,
                sequence_number=seq,
                defaults={
                    'name': f'Cuatrimestre {seq} {current_year}',
                    'start_date': start,
                    'end_date': end,
                    'is_closed': False,
                },
            )

        for seq, start, end in trim_ranges:
            Term.objects.update_or_create(
                academic_year=current_year,
                study_plan=trim,
                sequence_number=seq,
                defaults={
                    'name': f'Trimestre {seq} {current_year}',
                    'start_date': start,
                    'end_date': end,
                    'is_closed': False,
                },
            )

    def _seed_areas_and_subareas(self):
        area_map = {
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
            'biblioteca': {'name': 'Biblioteca', 'subareas': [('biblioteca-general', 'Biblioteca General')]},
            'bienestar-estudiantil': {
                'name': 'Bienestar Estudiantil',
                'subareas': [('danza', 'Danza'), ('futbol', 'Futbol'), ('voleibol', 'Voleibol')],
            },
        }

        for area_code, data in area_map.items():
            area, _ = Area.objects.update_or_create(
                code=area_code,
                defaults={'name': data['name'], 'is_active': True},
            )
            for sub_code, sub_name in data['subareas']:
                Subarea.objects.update_or_create(
                    area=area,
                    code=sub_code,
                    defaults={'name': sub_name, 'is_active': True},
                )

    def _seed_demo_admin(self):
        admin_role = Role.objects.get(code='admin')
        email = 'admin@sibec.local'
        if User.objects.filter(email=email).exists():
            return

        User.objects.create_superuser(
            email=email,
            password='Admin123456!',
            first_name='SIBEC',
            last_name='Admin',
            role=admin_role,
        )
