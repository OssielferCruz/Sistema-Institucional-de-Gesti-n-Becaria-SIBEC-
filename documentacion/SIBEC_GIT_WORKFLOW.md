# SIBEC - Flujo Git de Trabajo

Guia de trabajo para mantener el proyecto ordenado, versionado y facil de retomar.

## 1. Objetivo

Trabajar paso a paso con buenas practicas:

- cambios pequenos y trazables,
- ramas por objetivo,
- commits claros,
- integracion segura a rama principal.

## 2. Ramas del repositorio

### Rama principal

- main: estado estable e integrable.

### Ramas de trabajo

- feature/nombre-corto: nuevas funcionalidades.
- fix/nombre-corto: correcciones de bug.
- docs/nombre-corto: documentacion.
- chore/nombre-corto: tareas tecnicas de soporte.

Ejemplos:

- feature/backend-modelo-base
- feature/api-rbac-inicial
- fix/validacion-horas-duplicadas
- docs/arc42-base

## 3. Regla para crear nueva rama

Crear una nueva rama cuando:

1. El cambio afecte mas de un modulo.
2. El cambio tarde mas de una sesion corta.
3. El cambio pueda romper funcionalidad existente.
4. El cambio sea una entrega identificable por si sola.

No crear rama nueva cuando:

1. Solo se corrige un typo o ajuste minimo y aislado.
2. Es un cambio urgente y pequeno en el mismo alcance abierto.

## 4. Politica de commits

Formato sugerido:

tipo(scope): resumen breve en imperativo

Tipos permitidos:

- feat
- fix
- docs
- refactor
- test
- chore

Ejemplos:

- feat(backend): create core entities for students and assignments
- fix(api): validate teacher scope on hour logs
- docs(arc42): add context and building block view
- test(hours): cover approval and rejection flow

Reglas:

1. Un commit debe contar una sola historia tecnica.
2. Evitar commits gigantes mezclando backend, frontend y docs sin relacion.
3. Hacer commit solo cuando la app compila o al menos no rompe la parte tocada.
4. Incluir pruebas cuando el cambio sea logica de negocio.

## 5. Politica de merge

1. Rebase o merge desde main antes de abrir pull request.
2. Resolver conflictos en la rama de trabajo, no en main.
3. Merge a main solo con alcance validado y documentado.

## 6. Secuencia estandar por cada iteracion

1. Crear rama nueva segun alcance.
2. Implementar cambio pequeno.
3. Ejecutar pruebas o validaciones minimas.
4. Actualizar documentacion afectada.
5. Commit con mensaje claro.
6. Subir rama remota.
7. Abrir PR con descripcion, riesgos y checklist.

## 7. Checklist antes de cada commit

1. El cambio cumple el alcance acordado.
2. No hay archivos temporales ni secretos.
3. Las validaciones basicas pasan.
4. La documentacion esta alineada al cambio.

## 8. Rama sugerida para el siguiente paso

Proxima rama recomendada:

- feature/backend-scaffold-django

Objetivo:

- crear backend Django + DRF base,
- configurar PostgreSQL y variables,
- preparar estructura de apps,
- dejar el proyecto listo para primeras migraciones.
