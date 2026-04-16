# SIBEC - Comparación entre el Brief y la Interfaz Actual

Este documento resume cómo se alinea la interfaz base existente con los requisitos del brief del proyecto y qué decisiones conviene mantener para construir el MVP sin rehacer la UI desde cero.

## 1. Conclusión ejecutiva

La interfaz actual **sí puede servir como base final** para SIBEC.

No es necesario rediseñarla por completo, porque el brief pide una experiencia:

- limpia,
- estructurada,
- institucional,
- responsive,
- orientada a paneles por rol,
- enfocada en tablas, filtros y consulta eficiente.

Eso coincide con la base que ya existe en el proyecto.

Lo correcto es **conservar la estructura general** y **ajustar la identidad visual, los flujos y la conexión real con la API**.

## 2. Lo que dice el brief

El brief define que SIBEC debe cumplir con estos puntos clave:

1. Frontend en React con Vite.
2. Backend REST con Django, Flask, NestJS o FastAPI.
3. Base de datos relacional como PostgreSQL o MySQL.
4. Seguridad por roles con RBAC.
5. Cobertura mínima del 80 por ciento en pruebas de backend.
6. Interfaz limpia, sencilla, profesional y orientada a operación administrativa.
7. Navegación diferenciada por rol.
8. Uso de tablas claras, filtros y segmentación por cuatrimestre.

## 3. Lo que ya existe en la carpeta

La base actual ya muestra una estructura compatible con el brief:

- login,
- dashboard por rol,
- estudiantes,
- asignaciones,
- registro de horas,
- aprobaciones,
- reportes,
- configuración,
- progreso personal,
- pantallas de comunicación y control.

También existe una separación por rutas y componentes, lo que facilita convertir la UI actual en una aplicación conectada a backend real.

Además, la interfaz contiene funcionalidades adicionales incorporadas durante el diseño. Estas no deben descartarse automáticamente: se conservarán cuando sean coherentes con el dominio y se implementarán por fases.

## 4. Lo que se puede conservar

### Estructura general

- Layout principal con sidebar y zona de contenido.
- Navegación por módulos.
- Dashboards diferenciados por rol.
- Páginas separadas por responsabilidad.

### Patrón funcional

- Tablas para listar estudiantes, asignaciones y registros.
- Formularios para registrar horas.
- Vistas de aprobación y seguimiento.
- Pantallas de consulta de progreso.

### Enfoque visual

- Estética sobria y profesional.
- Interfaz orientada a usuarios institucionales.
- Jerarquía clara de información.
- Diseño responsive.

## 5. Lo que debe ajustarse

### Identidad visual

El brief sugiere una estética institucional con colores sobrios. Eso implica revisar:

- paleta de color,
- contraste,
- tipografía,
- estados visuales,
- consistencia de botones y badges.

### Navegación por rol

La interfaz debe mostrar solo lo que corresponde a cada rol.

No basta con ocultar opciones visualmente; el backend también debe restringir acceso.

### Estados y validaciones

Se deben representar con claridad estados como:

- pendiente,
- aprobado,
- rechazado,
- en revisión,
- anulado.

### Flujo de acciones

Cada pantalla debe reducir pasos innecesarios:

- registrar horas en pocos pasos,
- validar en bloque cuando sea posible,
- consultar progreso sin sobrecarga visual.

## 6. Lo que no conviene hacer ahora

- Rehacer toda la UI desde cero.
- Cambiar el stack frontend sin motivo técnico.
- Introducir un diseño visual demasiado experimental.
- Crear pantallas adicionales antes de cerrar el flujo principal.
- Separar la lógica visual del modelo real de permisos.

Nota de alcance: si una pantalla adicional ya existe en la UI base, se clasifica como "módulo extendido" y se agenda después de cerrar el flujo principal del MVP.

## 7. Criterio práctico para decidir si una pantalla se queda

Una pantalla actual se conserva si cumple con estas condiciones:

1. Representa bien el flujo del brief.
2. Es clara para un usuario institucional.
3. Puede conectarse a datos reales sin rediseño mayor.
4. Respeta el alcance del rol.
5. No complica el mantenimiento.

Si no cumple una de esas condiciones, se ajusta, pero no se reemplaza de forma innecesaria.

## 8. Ruta recomendada de trabajo

1. Congelar la estructura base de navegación.
2. Ajustar la identidad visual para alinearla al brief.
3. Definir el modelo de datos y el backend Django/DRF.
4. Reemplazar mocks por API real pantalla por pantalla.
5. Validar permisos reales en backend y frontend.
6. Probar los flujos críticos de cada rol.
7. Integrar funcionalidades adicionales de la UI en iteraciones controladas (MVP+).

## 9. Respuesta directa

Sí, la interfaz actual puede quedar muy cercana a la final.

La diferencia no debería estar en “reinventar” el sistema, sino en:

- conectar el backend real,
- respetar el RBAC,
- pulir la identidad visual,
- y ajustar los flujos a las reglas del brief.

## 10. Próxima decisión técnica

Lo siguiente que conviene documentar es el modelo de datos detallado para el backend, porque desde ahí se define cómo se alimentará cada pantalla de la interfaz actual.

## 11. Decisión confirmada sobre apariencia final

El producto final debe parecerse a la interfaz ya creada, manteniendo su estructura de navegación y su lenguaje visual general.

Los ajustes de estilo y usabilidad serán evolutivos, sin una ruptura visual total, para preservar continuidad en el diseño y en la implementación.
