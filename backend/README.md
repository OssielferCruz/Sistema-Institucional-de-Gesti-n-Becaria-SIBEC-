# Backend SIBEC

## Setup rapido

1. Crear entorno virtual

```
python -m venv .venv
```

2. Instalar dependencias

```
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

3. Ejecutar migraciones

```
.\.venv\Scripts\python.exe manage.py migrate
```

4. Cargar catalogos iniciales

```
.\.venv\Scripts\python.exe manage.py seed_initial_data
```

## Pruebas

Ejecutar test suite:

```
.\.venv\Scripts\python.exe -m pytest -q
```

Ejecutar pruebas con coverage:

```
.\.venv\Scripts\python.exe -m coverage run -m pytest
.\.venv\Scripts\python.exe -m coverage report -m
```

## Importacion inicial de estudiantes

1. Preparar CSV con columnas:

- student_code
- first_name
- last_name
- email
- career_code
- study_plan_code
- admission_year
- required_annual_hours

2. Endpoint:

- POST /api/v1/students/import_csv/
- Form-data con campo file
