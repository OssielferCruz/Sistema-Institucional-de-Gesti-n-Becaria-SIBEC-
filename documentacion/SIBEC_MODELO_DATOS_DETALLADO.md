# SIBEC - Modelo de Datos Detallado

Documento técnico para implementar el modelo de datos del MVP en Django y Django REST Framework, con enfoque en mantenibilidad, flexibilidad de reglas y preparación para cambios futuros en la metodología de distribución de horas.

## 1. Objetivo del modelo

Este diseño busca:

- soportar el flujo operativo principal del MVP,
- cumplir RBAC con rol único por usuario,
- permitir distribución de horas configurable por plan académico,
- habilitar trazabilidad y auditoría,
- reducir riesgo ante cambios futuros de normativa institucional.

## 2. Convenciones técnicas

- Base de datos objetivo: PostgreSQL.
- Claves primarias: UUID en tablas de negocio.
- Campos de auditoría comunes: created_at, updated_at, created_by, updated_by cuando aplique.
- Borrado lógico en entidades maestras críticas mediante is_active.
- Nombres de tablas en plural y snake_case.
- Estados definidos mediante choices y validados en backend.

## 3. Módulos de dominio sugeridos (apps Django)

- accounts
- academic
- organization
- scholarships
- hours
- approvals
- reporting
- auditing

## 4. Catálogo de entidades

### 4.1 accounts_role

Propósito: catálogo de roles del sistema.

Campos:

- id (UUID, PK)
- code (varchar(30), unique) Ejemplos: admin, jefatura, docente, estudiante
- name (varchar(80))
- description (text, null)
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(code)
- index(is_active)

### 4.2 accounts_user

Propósito: usuario autenticable con rol único.

Campos:

- id (UUID, PK)
- email (varchar(255), unique)
- password_hash (django auth)
- first_name (varchar(120))
- last_name (varchar(120))
- role_id (FK -> accounts_role, not null)
- is_staff (bool)
- is_superuser (bool)
- is_active (bool, default true)
- last_login (timestamp, null)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(email)
- index(role_id, is_active)
- check(email <> '')

Notas:

- La regla de negocio es rol único por usuario.
- Recomendado usar AbstractBaseUser + PermissionsMixin.

### 4.3 academic_career

Propósito: carreras institucionales.

Campos:

- id (UUID, PK)
- code (varchar(30), unique)
- name (varchar(150), unique)
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(code)
- unique(name)

### 4.4 academic_study_plan

Propósito: plan académico del estudiante y su tipo de periodización.

Campos:

- id (UUID, PK)
- code (varchar(30), unique) Ejemplo: CUATRI, TRIM
- name (varchar(100))
- period_type (varchar(20)) Valores: cuatrimestre, trimestre, otro
- periods_per_year (smallint) Ejemplos: 3, 4
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(code)
- check(periods_per_year > 0)

### 4.5 academic_term

Propósito: períodos académicos concretos para operación anual.

Campos:

- id (UUID, PK)
- academic_year (smallint)
- study_plan_id (FK -> academic_study_plan)
- sequence_number (smallint) Ejemplo: 1, 2, 3
- name (varchar(100)) Ejemplo: Cuatrimestre 1 2026
- start_date (date)
- end_date (date)
- is_closed (bool, default false)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(academic_year, study_plan_id, sequence_number)
- check(start_date <= end_date)
- index(study_plan_id, academic_year)

### 4.6 organization_area

Propósito: áreas institucionales de horas sociales.

Campos:

- id (UUID, PK)
- code (varchar(30), unique)
- name (varchar(120), unique)
- description (text, null)
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

### 4.7 organization_subarea

Propósito: subáreas asociadas a un área.

Campos:

- id (UUID, PK)
- area_id (FK -> organization_area)
- code (varchar(30))
- name (varchar(150))
- description (text, null)
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(area_id, code)
- unique(area_id, name)
- index(area_id, is_active)

### 4.8 scholarships_student

Propósito: perfil académico-operativo del estudiante becado.

Campos:

- id (UUID, PK)
- user_id (FK -> accounts_user, unique)
- student_code (varchar(30), unique)
- career_id (FK -> academic_career)
- study_plan_id (FK -> academic_study_plan)
- admission_year (smallint)
- scholarship_status (varchar(30)) Valores: activa, suspendida, finalizada
- required_annual_hours (integer, default 150)
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(student_code)
- check(required_annual_hours > 0)
- index(career_id, study_plan_id, is_active)

### 4.9 scholarships_teacher_profile

Propósito: perfil de docente responsable de registro.

Campos:

- id (UUID, PK)
- user_id (FK -> accounts_user, unique)
- employee_code (varchar(30), unique, null)
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

### 4.10 scholarships_department_head_profile

Propósito: perfil de jefatura con alcance por carrera.

Campos:

- id (UUID, PK)
- user_id (FK -> accounts_user, unique)
- career_id (FK -> academic_career)
- is_active (bool, default true)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(user_id, career_id)
- index(career_id, is_active)

### 4.11 scholarships_assignment

Propósito: asignación operativa del estudiante a subárea y docente para un período.

Campos:

- id (UUID, PK)
- student_id (FK -> scholarships_student)
- subarea_id (FK -> organization_subarea)
- teacher_profile_id (FK -> scholarships_teacher_profile)
- term_id (FK -> academic_term)
- assigned_at (timestamp)
- end_at (timestamp, null)
- status (varchar(30)) Valores: activa, cerrada, anulada
- notes (text, null)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(student_id, term_id, status) filtrado para status activa
- index(student_id, term_id)
- index(teacher_profile_id, term_id)
- check(end_at is null or end_at >= assigned_at)

### 4.12 hours_policy

Propósito: política versionada de distribución de horas.

Campos:

- id (UUID, PK)
- name (varchar(120))
- version (integer)
- annual_target_hours (integer, default 150)
- is_active (bool, default false)
- valid_from (date)
- valid_to (date, null)
- description (text, null)
- created_by_id (FK -> accounts_user)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(name, version)
- check(annual_target_hours > 0)
- check(valid_to is null or valid_to >= valid_from)
- index(is_active, valid_from)

Regla:

- Solo una política activa por rango temporal de operación.

### 4.13 hours_policy_segment

Propósito: definición de metas por período dentro de una política.

Campos:

- id (UUID, PK)
- policy_id (FK -> hours_policy)
- study_plan_id (FK -> academic_study_plan)
- period_sequence (smallint)
- target_hours (integer)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(policy_id, study_plan_id, period_sequence)
- check(target_hours >= 0)
- index(policy_id, study_plan_id)

Regla:

- La suma de target_hours por study_plan en cada policy debe igualar annual_target_hours.
- Esta validación se implementa en servicio de dominio y en serializer.

### 4.14 hours_log

Propósito: registro de horas realizado por docente.

Campos:

- id (UUID, PK)
- student_id (FK -> scholarships_student)
- assignment_id (FK -> scholarships_assignment)
- teacher_profile_id (FK -> scholarships_teacher_profile)
- term_id (FK -> academic_term)
- work_date (date)
- start_time (time)
- end_time (time)
- reported_hours (numeric(5,2))
- description (text)
- status (varchar(30)) Valores: registrado, en_revision, aprobado, rechazado, anulado
- locked_at (timestamp, null)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- index(student_id, term_id, status)
- index(teacher_profile_id, work_date)
- check(end_time > start_time)
- check(reported_hours > 0)

Reglas:

- El docente del log debe coincidir con el docente de la asignación activa.
- No permitir crear logs en términos cerrados.

### 4.15 approvals_hours_review

Propósito: decisión de jefatura sobre un registro.

Campos:

- id (UUID, PK)
- hours_log_id (FK -> hours_log, unique)
- reviewer_id (FK -> scholarships_department_head_profile)
- decision (varchar(20)) Valores: aprobado, rechazado
- comments (text, null)
- reviewed_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(hours_log_id)
- index(reviewer_id, reviewed_at)

Reglas:

- El reviewer debe pertenecer a la misma carrera del estudiante.
- Al aprobar o rechazar, se bloquea edición del hours_log.

### 4.16 hours_evidence

Propósito: archivos o referencias de evidencia del registro.

Campos:

- id (UUID, PK)
- hours_log_id (FK -> hours_log)
- file_url (varchar(500))
- original_name (varchar(255))
- mime_type (varchar(100))
- uploaded_by_id (FK -> accounts_user)
- created_at (timestamp)

Índices:

- index(hours_log_id)

### 4.17 reporting_weekly_report

Propósito: reporte semanal enviado a bienestar.

Campos:

- id (UUID, PK)
- department_head_id (FK -> scholarships_department_head_profile)
- term_id (FK -> academic_term)
- week_start (date)
- week_end (date)
- summary (text)
- status (varchar(20)) Valores: borrador, enviado
- sent_at (timestamp, null)
- created_at (timestamp)
- updated_at (timestamp)

Índices y constraints:

- unique(department_head_id, term_id, week_start, week_end)
- check(week_end >= week_start)

### 4.18 auditing_audit_event

Propósito: trazabilidad de cambios críticos.

Campos:

- id (UUID, PK)
- actor_id (FK -> accounts_user, null)
- event_type (varchar(80)) Ejemplo: hours_approved, assignment_changed
- entity_name (varchar(80))
- entity_id (UUID)
- before_data (jsonb, null)
- after_data (jsonb, null)
- ip_address (varchar(64), null)
- user_agent (varchar(255), null)
- created_at (timestamp)

Índices:

- index(entity_name, entity_id)
- index(actor_id, created_at)
- index(event_type, created_at)

## 5. Relación de alto nivel

Flujo principal de datos:

1. accounts_user se vincula a role.
2. Si el rol es estudiante, existe scholarships_student.
3. Si el rol es docente, existe scholarships_teacher_profile.
4. Si el rol es jefatura, existe scholarships_department_head_profile.
5. scholarships_assignment une estudiante, docente, subárea y período.
6. hours_log usa asignación activa para registrar horas.
7. approvals_hours_review decide el estado final del log.
8. reporting_weekly_report consolida información por jefatura.
9. auditing_audit_event registra acciones relevantes.

## 6. Reglas de integridad críticas

1. Rol único por usuario, validado en modelo y serializers.
2. No permitir logs fuera de asignación activa.
3. No permitir aprobación por jefatura fuera de su carrera.
4. No permitir edición de logs aprobados o rechazados.
5. No permitir superación de límites por período si política lo restringe.
6. Política y segmentos de distribución con suma consistente.

## 7. Importación inicial de estudiantes

Entidad impactada:

- scholarships_student
- accounts_user
- academic_career
- academic_study_plan

Formato recomendado de entrada:

- student_code
- first_name
- last_name
- email
- career_code
- study_plan_code
- required_annual_hours (opcional, default 150)

Reglas de importación:

1. Validación previa de duplicados por email y student_code.
2. Si la carrera o plan no existe, registrar error por fila.
3. Crear usuario con rol estudiante.
4. Reporte final de filas válidas e inválidas.

## 8. Orden recomendado de migraciones

1. accounts_role
2. accounts_user
3. academic_career
4. academic_study_plan
5. academic_term
6. organization_area
7. organization_subarea
8. scholarships_student
9. scholarships_teacher_profile
10. scholarships_department_head_profile
11. scholarships_assignment
12. hours_policy
13. hours_policy_segment
14. hours_log
15. approvals_hours_review
16. hours_evidence
17. reporting_weekly_report
18. auditing_audit_event

## 9. Mapeo inicial a endpoints DRF

- GET/POST /api/v1/students
- POST /api/v1/students/import
- GET/POST /api/v1/assignments
- GET/POST /api/v1/hours/logs
- POST /api/v1/hours/logs/{id}/approve
- POST /api/v1/hours/logs/{id}/reject
- GET /api/v1/me/progress
- GET/POST /api/v1/policies
- GET/POST /api/v1/policies/{id}/segments

## 10. Cobertura de pruebas recomendada para este modelo

Mínimo para acercarse al 80 por ciento:

1. Tests de constraints y validaciones de modelos.
2. Tests de permisos por rol en endpoints.
3. Tests de flujo docente -> jefatura -> estudiante.
4. Tests de política de distribución por plan académico.
5. Tests de importación de estudiantes con datos válidos e inválidos.

## 11. Notas de evolución futura

Para soportar cambios administrativos sin romper el sistema:

- no fijar distribución por cuatrimestre en código,
- usar policies versionadas,
- registrar historial de cambios,
- mantener API estable y extender por versión cuando sea necesario.
