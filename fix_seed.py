import re

file_path = r'C:\Users\fernd\OneDrive\Desktop\PROYECTO SIBEC\Desarrollar aplicación web SIBEC\backend\apps\accounts\management\commands\seed_operational_data.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will just write a new version of the lists
new_heads = '''    DEPARTMENT_HEADS = [
        {'email': 'jefatura.ice@ulsa.edu.ni', 'first_name': 'Laura Patricia', 'last_name': 'Mendoza Rios', 'career_code': 'ice'},
        {'email': 'jefatura.iem@ulsa.edu.ni', 'first_name': 'Rafael Antonio', 'last_name': 'Cruz Silva', 'career_code': 'iem'},
        {'email': 'jefatura.ime@ulsa.edu.ni', 'first_name': 'Patricia Elena', 'last_name': 'Flores Vargas', 'career_code': 'ime'},
        {'email': 'jefatura.ims@ulsa.edu.ni', 'first_name': 'David Eduardo', 'last_name': 'Hernandez Solis', 'career_code': 'ims'},
        {'email': 'jefatura.iel@ulsa.edu.ni', 'first_name': 'Claudia Maria', 'last_name': 'Morales Pineda', 'career_code': 'iel'},
        {'email': 'jefatura.igi@ulsa.edu.ni', 'first_name': 'Monica Sofia', 'last_name': 'Pineda Rivas', 'career_code': 'igi'},
        {'email': 'jefatura.lcm@ulsa.edu.ni', 'first_name': 'Jorge Luis', 'last_name': 'Salas Ruiz', 'career_code': 'lcm'},
        {'email': 'jefatura.laf@ulsa.edu.ni', 'first_name': 'Diana Carolina', 'last_name': 'Campos Soto', 'career_code': 'laf'},
    ]'''

new_teachers = '''    TEACHERS = [
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
    ]'''

new_students = '''    STUDENTS = [
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
    ]'''

content = re.sub(r'    DEPARTMENT_HEADS = \[.*?\]\n', new_heads + '\n\n', content, flags=re.DOTALL)
content = re.sub(r'    TEACHERS = \[.*?\]\n', new_teachers + '\n\n', content, flags=re.DOTALL)
content = re.sub(r'    STUDENTS = \[.*?\]\n', new_students + '\n\n', content, flags=re.DOTALL)

# Handle the study plan hybrid assignments
content = content.replace("study_plan = StudyPlan.objects.get(code='cuatri')", "cuatri = StudyPlan.objects.get(code='cuatri')\n            trim = StudyPlan.objects.get(code='trim')")
content = content.replace("active_term = self._get_active_term(study_plan)", "active_term_cuatri = self._get_active_term(cuatri)\n            active_term_trim = self._get_active_term(trim)")
content = content.replace("assignments = self._seed_students_and_assignments(\n                role_estudiante,\n                study_plan,\n                active_term,\n                teacher_by_subarea,\n            )", "assignments = self._seed_students_and_assignments(\n                role_estudiante,\n                cuatri,\n                trim,\n                active_term_cuatri,\n                active_term_trim,\n                teacher_by_subarea,\n            )")

# Fix the method signature
content = content.replace("def _seed_students_and_assignments(\n        self,\n        role_estudiante: Role,\n        study_plan: StudyPlan,\n        term: Term,\n        teacher_by_subarea: dict[str, TeacherProfile],\n    ) -> list[Assignment]:", "def _seed_students_and_assignments(\n        self,\n        role_estudiante: Role,\n        cuatri: StudyPlan,\n        trim: StudyPlan,\n        active_term_cuatri: Term,\n        active_term_trim: Term,\n        teacher_by_subarea: dict[str, TeacherProfile],\n    ) -> list[Assignment]:")

# Fix the student body creation
content = content.replace("'study_plan': study_plan,", "                    'study_plan': trim if payload.get('study_plan') == 'trim' else cuatri,")
content = content.replace("assignment = Assignment.objects.filter(student=student, term=term, status='active').first()", "term_to_use = active_term_trim if payload.get('study_plan') == 'trim' else active_term_cuatri\n            assignment = Assignment.objects.filter(student=student, term=term_to_use, status='active').first()")
content = content.replace("term=term,", "term=term_to_use,")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
