# SIBEC Deploy Runbook

## Objetivo
Guia operativa para desplegar frontend + backend en produccion con chequeos minimos.

## Arquitectura recomendada
- Frontend (Vite build estatico): Vercel o Netlify.
- Backend (Django + DRF): Render, Railway o VPS.
- Base de datos: PostgreSQL administrado.

## Variables de entorno

### Frontend
Archivo base: frontend.env.example

Variables:
- VITE_API_BASE_URL=https://api.tu-dominio.com

### Backend
Archivo base: backend/.env.example

Variables minimas:
- DEBUG=False
- SECRET_KEY=<valor-seguro-largo>
- ALLOWED_HOSTS=api.tu-dominio.com
- DATABASE_URL=postgresql://user:pass@host:5432/dbname
- CORS_ALLOWED_ORIGINS=https://app.tu-dominio.com
- CSRF_TRUSTED_ORIGINS=https://app.tu-dominio.com
- SECURE_SSL_REDIRECT=True
- SESSION_COOKIE_SECURE=True
- CSRF_COOKIE_SECURE=True
- SECURE_HSTS_SECONDS=31536000
- SECURE_HSTS_INCLUDE_SUBDOMAINS=True

## Orden de despliegue
1. Desplegar base de datos PostgreSQL.
2. Configurar variables de entorno en backend.
3. Ejecutar migraciones backend.
4. Probar probes backend:
- GET /healthz/
- GET /readyz/
5. Configurar y desplegar frontend con VITE_API_BASE_URL apuntando al backend.
6. Validar login y flujos principales por rol.

## Comandos backend
En backend:

```bash
python manage.py migrate
python manage.py check --deploy --fail-level WARNING
python manage.py seed_initial_data
python -m pytest -q
```

## Verificaciones post-deploy
- Backend responde 200 en /healthz/ y /readyz/.
- Login funciona con JWT.
- Flujo de registro y aprobacion de horas operativo.
- CORS solo permite origenes esperados.

## Rollback rapido
1. Restaurar version previa del backend.
2. Restaurar snapshot de base de datos si hubo migracion incompatible.
3. Invalidar sesiones si cambio de esquema afecta auth.
