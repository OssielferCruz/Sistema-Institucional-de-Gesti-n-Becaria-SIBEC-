# Permisos y Acciones por Rol - SIBEC

## Estructura de Áreas

El sistema maneja 10 áreas principales, algunas con subáreas:

### 1. **Asistencia Docente** (5 Jefaturas)
- Jefatura ICE/IEM
- Jefatura IME
- Jefatura IMS/IEL
- Jefatura IGI
- Jefatura LCM/LAF

### 2. **Biblioteca**

### 3. **Bienestar Estudiantil** (3 subáreas)
- Danza
- Fútbol
- Voleibol

### 4. **Extensión Universitaria** (3 subáreas)
- Coro
- Misioneros
- Brigada Ambiental

### 5. **CIDTEA** (2 subáreas)
- Taller y Laboratorio
- Proyectos de Investigación Ambiental

### 6. **Brigada Ambiental**
### 7. **Comunicación Institucional**
### 8. **Decanatura**
### 9. **Educación a Distancia**
### 10. **Registro Académico**

---

## Jerarquía del Sistema

```
Jefatura de Carrera
    ↓
Docentes Responsables (encargados de subáreas)
    ↓
Estudiantes Becados
```

**Nota importante**: Cada subárea tiene un docente responsable diferente. Por ejemplo, en Asistencia Docente hay 5 docentes (uno por cada jefatura), cada uno a cargo de estudiantes de carreras específicas.

---

## 1. Bienestar Estudiantil (Admin)
**Rol más alto en la jerarquía** - Acceso completo al sistema

### Acceso a Módulos:
- ✅ Dashboard
- ✅ Estudiantes (CRUD completo)
- ✅ Áreas de Horas Sociales (gestión completa de áreas, subáreas y asignaciones)
- ✅ Reportes (recibe reportes de Jefatura)
- ✅ Configuración

### Acciones Permitidas:
- Agregar/Eliminar estudiantes de la base de datos
- Ver lista de todas las áreas y subáreas para horas sociales
- Agregar/Quitar áreas
- Asignar estudiantes a áreas y subáreas específicas
- Asignar docentes responsables a estudiantes
- Visualizar progreso de TODOS los estudiantes
- Recibir reportes y solicitudes de Jefes de carrera
- Configuración general del sistema

---

## 2. Jefatura de Carrera
**Segundo eslabón** - Mantiene comunicación con Bienestar Estudiantil

### Acceso a Módulos:
- ✅ Dashboard
- ✅ Validación de Horas (solo de su carrera)
- ✅ Reportes (envía reportes semanales)

### Acciones Permitidas:
- Ver estudiantes SOLO de su carrera correspondiente
- **Ver docentes asignados a estudiantes de su carrera**
- Visualizar registro de horas añadido por docentes
- Validar registros de horas semanalmente (aprobar/rechazar)
- Ver qué docente registró cada hora
- Enviar reporte semanal a Bienestar Estudiantil
- **IMPORTANTE**: Después de validar, los datos NO se pueden editar (para evitar inconsistencias)

### Ejemplo de Jerarquía:
```
Jefatura ICE/IEM
    ↓
Dr. Roberto Méndez (Docente - Jefatura ICE/IEM)
    ↓
- Juan Carlos Pérez (ICE)
- María Fernanda López (IEM)
```

### Limitaciones:
- ❌ NO puede cambiar estudiantes de área directamente
- ✅ Puede solicitar a Bienestar permiso para cambiar estudiantes de área

---

## 3. Docentes Responsables
**Tercer eslabón** - Solo registro de horas

### Acceso a Módulos:
- ✅ Dashboard
- ✅ Registro de Horas (ÚNICO módulo funcional)

### Acciones Permitidas:
- Registrar horas sociales realizadas por **sus estudiantes asignados**
- Indicar:
  - Día
  - Hora de inicio
  - Hora de fin
  - Cantidad de horas realizadas
  - Breve descripción de la actividad
- Los registros incluyen automáticamente:
  - Área y subárea asignada
  - Nombre del docente que registra
  - Carrera del estudiante

### Tipo de Docentes:
1. **Docentes de Asistencia Docente**: Asignados a jefaturas específicas (ICE/IEM, IME, etc.)
2. **Docentes de otras áreas**: Biblioteca, Bienestar, CIDTEA, etc.

### Limitaciones:
- ❌ NO puede ver progreso de estudiantes
- ❌ NO puede editar registros después de crearlos
- ❌ NO puede acceder a otras secciones del sistema
- ❌ NO puede registrar horas de estudiantes que no estén asignados a él
- Solo puede REGISTRAR horas de sus estudiantes asignados

---

## 4. Estudiantes Becados
**Último eslabón** - Solo visualización

### Acceso a Módulos:
- ✅ Dashboard
- ✅ Mi Progreso (vista personal)

### Acciones Permitidas:
- Ver su propio progreso de horas sociales
- Visualizar avance por cuatrimestre
- Ver historial de horas aprobadas (solo las validadas por jefatura)
- Ver área y subárea actual asignada
- Ver docente responsable asignado

### Limitaciones:
- ❌ NO tiene permisos de edición
- ❌ NO puede ver progreso de otros estudiantes
- ❌ NO puede acceder a ninguna otra parte del sistema
- ❌ NO puede ver horas pendientes o rechazadas en detalle
- Solo VISUALIZACIÓN de su información personal

---

## Flujo de Trabajo del Sistema

1. **Bienestar Estudiantil** asigna estudiantes a áreas/subáreas y docentes responsables
2. **Docentes** registran las horas trabajadas por sus estudiantes asignados
3. **Jefatura de Carrera** valida los registros semanalmente (ve estudiante + docente + horas)
4. **Jefatura** envía reporte consolidado a Bienestar
5. **Estudiantes** pueden ver su progreso actualizado (solo horas aprobadas)

---

## Navegación Filtrada por Rol

El sistema muestra automáticamente solo las opciones de menú correspondientes a cada rol:

- **Admin**: 5 opciones (Dashboard, Estudiantes, Áreas de Horas Sociales, Reportes, Configuración)
- **Jefatura**: 3 opciones (Dashboard, Validación de Horas, Reportes)
- **Docente**: 2 opciones (Dashboard, Registro de Horas)
- **Estudiante**: 2 opciones (Dashboard, Mi Progreso)

---

## Relación Área → Subárea → Docente → Estudiantes

Ejemplo completo:

```
Área: Asistencia Docente
    ├─ Subárea: Jefatura ICE/IEM
    │   └─ Docente: Dr. Roberto Méndez
    │       ├─ Estudiante: Juan Carlos Pérez (ICE)
    │       └─ Estudiante: María Fernanda López (IEM)
    │
    ├─ Subárea: Jefatura IME
    │   └─ Docente: Ing. Patricia Flores
    │       └─ Estudiante: Carlos Alberto Sánchez (IME)
    │
    └─ ... (otras jefaturas)

Área: Biblioteca
    └─ Docente: Lic. Ana Martínez
        ├─ Estudiante: Jorge Enrique Castillo (ICE)
        └─ Estudiante: Gabriela Monserrat Herrera (LAF)

Área: Bienestar Estudiantil
    ├─ Subárea: Danza
    │   └─ Docente: Prof. Miguel Torres
    │       └─ Estudiante: Andrea Valeria Romero (LCM)
    │
    ├─ Subárea: Fútbol
    │   └─ Docente: Prof. Daniel Castro
    │       └─ Estudiante: Diego Alejandro Jiménez (IGI)
    │
    └─ Subárea: Voleibol
        └─ Docente: Profa. Sandra Ortiz
            └─ Estudiante: Sofía Alejandra Navarro (IEM)
```