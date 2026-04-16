# SIBEC - Ruta de Arquitectura y MVP

Documento vivo de referencia para construir el MVP funcional de SIBEC con base en el diseño ya existente. La intención de este archivo es evitar decisiones dispersas, mantener coherencia técnica y servir como guía de implementación durante todo el proyecto.

## 1. Objetivo del proyecto

SIBEC es el Sistema Institucional de Gestión Becaria orientado a controlar, validar y consultar las horas sociales de estudiantes becados.

El MVP debe cubrir el flujo principal de negocio:

1. Bienestar registra y administra estudiantes, áreas, subáreas y docentes responsables.
2. Docentes registran horas solo de sus estudiantes asignados.
3. Jefatura valida semanalmente los registros de su carrera.
4. Estudiantes consultan solo su progreso aprobado.

## 2. Principios de diseño

- Mantener el sistema modular, pero en un solo backend monolítico.
- Priorizar reglas de negocio y permisos por encima de la apariencia.
- Exponer solo los datos que cada rol necesita.
- Evitar duplicar lógica entre frontend y backend.
- Evitar reglas de horas hardcodeadas: usar configuración parametrizable.
- Construir primero el flujo crítico y después los módulos secundarios.
- Documentar cada decisión importante para facilitar mantenimiento.

## 3. Stack recomendado y decisión técnica

### Backend

- Python 3.12+
- Django
- Django REST Framework
- PostgreSQL
- JWT para autenticación
- pytest-django para pruebas

### Frontend

- React con Vite
- TypeScript
- React Router
- TanStack Query o equivalente para consumo de API
- React Hook Form + Zod para formularios

### Arquitectura y documentación

- Arquitectura MVTC o una variante limpia por capas dentro de Django
- Documentación arquitectónica siguiendo arc42
- Docker desde etapas tempranas para desarrollo reproducible

### Decisión de base de datos

PostgreSQL es la opción preferida por:

- Integridad relacional sólida.
- Mejor soporte para consultas de reportes y filtros complejos.
- Buen manejo de constraints, índices y JSON si se requiere extender metadatos.
- Mayor alineación con un sistema institucional con trazabilidad y auditoría.

MySQL solo se justificaría si la infraestructura institucional ya lo exigiera de forma explícita.

## 4. Alcance funcional del MVP

### Rol 1: Bienestar Estudiantil / Admin

- Crear, editar y desactivar estudiantes.
- Crear áreas y subáreas.
- Asignar docentes responsables.
- Asignar estudiantes a una subárea y docente.
- Ver progreso global.
- Ver y exportar reportes base.
- Gestionar configuración institucional del sistema.

### Rol 2: Jefatura de Carrera

- Ver solo estudiantes de su carrera.
- Revisar registros de horas de su ámbito.
- Aprobar o rechazar registros.
- Enviar reportes semanales.
- Consultar quién registró cada hora.
- No editar registros ya validados.

### Rol 3: Docente Responsable

- Registrar horas de estudiantes asignados.
- Ver solo sus estudiantes asignados.
- Registrar fecha, hora inicio, hora fin, total de horas y descripción.
- No editar registros una vez creados, salvo que el flujo institucional lo autorice explícitamente.

### Rol 4: Estudiante Becado

- Ver solo su progreso.
- Ver horas aprobadas.
- Ver su asignación actual.
- Ver su docente responsable.

## 4.1 Decisiones confirmadas (15-04-2026)

1. Cada usuario tiene un único rol.
2. Se implementará importación inicial de estudiantes para pruebas funcionales.
3. Cada estudiante debe cumplir 150 horas anuales.
4. La distribución de horas por período depende del plan académico del estudiante.
5. El sistema debe permitir cambiar la metodología de distribución en el futuro sin romper la aplicación.
6. La interfaz actual se mantiene como referencia principal, incluyendo funcionalidades adicionales ya diseñadas, siempre que respeten RBAC y reglas de negocio.

## 5. Modelo de datos de alto nivel

Las entidades base recomendadas son:

- Usuario
- Rol
- Carrera
- Área
- Subárea
- Docente
- Estudiante
- Asignación
- Período académico
- Plan académico
- Política de horas
- Tramo de distribución de horas
- Registro de horas
- Validación de horas
- Evidencia
- Reporte
- Auditoría

### Relaciones principales

- Cada usuario tiene un único rol activo dentro del sistema.
- Una carrera tiene muchos estudiantes.
- Un área tiene una o varias subáreas.
- Una subárea pertenece a un área.
- Una subárea tiene un docente responsable.
- Un estudiante pertenece a una carrera y a una asignación activa.
- Una asignación vincula estudiante, subárea, docente y período.
- Un estudiante pertenece a un plan académico activo (cuatrimestral, trimestral u otro futuro).
- Una política de horas define el total anual y su forma de distribución.
- Un tramo de distribución define metas por período según la política y el plan académico.
- Un registro de horas pertenece a un estudiante y a un docente que lo capturó.
- Una validación pertenece a un registro de horas y a una jefatura.

## 6. Reglas de negocio mínimas

1. Un docente solo puede registrar horas para estudiantes asignados a él.
2. Jefatura solo puede validar registros dentro de su carrera o unidad autorizada.
3. El estudiante solo ve información aprobada sobre sí mismo.
4. Un registro validado no debe poder editarse sin un flujo de corrección auditado.
5. Toda acción sensible debe quedar registrada en auditoría.
6. Los estados del registro deben ser explícitos y consistentes.
7. La meta anual por defecto es 150 horas por estudiante.
8. La meta por período se calcula desde la política activa y el plan académico del estudiante, no con valores fijos en código.
9. Toda modificación de políticas de horas debe ser versionada y auditable.

Estados sugeridos para el registro de horas:

- Borrador
- Registrado
- En revision
- Aprobado
- Rechazado
- Anulado

## 7. RBAC propuesto

El control de acceso no debe depender solo del menú visual. Debe existir en backend y frontend.

### Permisos base

- `student.read_own`
- `hours.create_own_scope`
- `hours.read_scope`
- `hours.approve_scope`
- `assignments.manage`
- `students.manage`
- `reports.view_scope`
- `reports.export_scope`
- `system.admin`

### Principio de aplicación

- El frontend muestra solo opciones permitidas.
- El backend valida siempre el permiso real.
- La validación por objeto es obligatoria para horarios, asignaciones y aprobaciones.

## 8. Ruta de implementación

### Fase 0. Definición y base técnica

- Confirmar alcance MVP.
- Congelar roles, estados y reglas críticas.
- Crear proyecto Django y apps de dominio.
- Configurar PostgreSQL, entorno local y variables.
- Definir arquitectura de carpetas y convenciones.

### Fase 1. Modelo de datos y autenticación

- Crear entidades base.
- Generar migraciones.
- Implementar usuarios, roles y autenticación JWT.
- Implementar relación usuario-rol único.
- Implementar plan académico y política de horas parametrizable.
- Sembrar datos iniciales para desarrollo.

### Fase 2. API principal

- Serializers con validación de negocio.
- ViewSets y rutas versionadas.
- Permisos por rol y por objeto.
- Endpoint de importación inicial de estudiantes (archivo CSV o Excel).
- Endpoints para estudiantes, asignaciones y registros de horas.

### Fase 3. Flujo operativo completo

- Registro de horas por docente.
- Validación por jefatura.
- Consulta de progreso por estudiante.
- Cálculo de metas por período según plan académico y política activa.
- Reportes base para bienestar.

### Fase 4. Integración frontend

- Sustituir mocks por consumo real de API.
- Conectar login, dashboard, registro, validación y consultas.
- Mantener la UI existente como referencia visual.

### Fase 5. Endurecimiento y calidad

- Auditoría completa.
- Exportación de reportes.
- Manejo de errores consistente.
- Pruebas automatizadas y cobertura mínima del 80 por ciento en backend.

## 9. Estrategia de pruebas

La meta de calidad inicial debe concentrarse en backend.

### Prioridad de pruebas

1. Modelos y reglas de negocio.
2. Serializers y validaciones.
3. Permisos y restricciones por rol.
4. Endpoints críticos.
5. Casos de aprobación y rechazo.
6. Consulta de progreso del estudiante.

### Herramientas sugeridas

- pytest
- pytest-django
- factory_boy
- coverage

## 10. Criterios de completitud del MVP

El MVP se considera listo cuando:

- El login funciona por rol.
- Cada rol solo ve y ejecuta lo que le corresponde.
- Los docentes registran horas en su ámbito correcto.
- Jefatura valida registros sin romper trazabilidad.
- El estudiante consulta su progreso correcto y actualizado.
- El backend tiene pruebas automatizadas suficientes para superar el 80 por ciento de cobertura en la capa crítica.
- La documentación arc42 cubre contexto, decisiones, componentes y riesgos.

## 11. Riesgos principales

- Permisos definidos solo en UI y no en backend.
- Cambios de negocio tardíos sobre estados de horas.
- Ambigüedad en la jerarquía real de carreras, áreas y subáreas.
- Falta de datos maestros iniciales para pruebas.
- Complejidad excesiva si se intenta convertir esto en microservicios antes de tiempo.

## 12. Decisiones fijas por ahora

- Backend: Django + DRF.
- Base de datos: PostgreSQL.
- Frontend: React con Vite.
- Seguridad: JWT.
- Usuarios con rol único.
- Regla anual inicial de 150 horas con distribución parametrizable.
- Arquitectura: monolito modular, no microservicios.
- Documentación: arc42.
- Calidad: pruebas automatizadas desde etapas tempranas.

## 13. Próximo paso recomendado

La siguiente entrega debería ser la especificación del modelo de datos en detalle, con tablas, campos, claves, constraints y relaciones listas para migraciones Django.
