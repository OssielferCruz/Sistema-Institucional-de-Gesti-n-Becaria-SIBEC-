from django.db import connections
from django.http import JsonResponse
from django.utils import timezone


def _database_probe() -> bool:
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return True
    except Exception:
        return False


def healthcheck(request):
    """Liveness probe for deployments."""
    database_ok = _database_probe()

    if not database_ok:
        return JsonResponse(
            {
                "status": "degraded",
                "database": "down",
                "timestamp": timezone.now().isoformat(),
            },
            status=503,
        )

    return JsonResponse(
        {
            "status": "ok",
            "database": "up",
            "timestamp": timezone.now().isoformat(),
        }
    )


def readycheck(request):
    """Readiness probe for deployments."""
    database_ok = _database_probe()
    if not database_ok:
        return JsonResponse(
            {
                "status": "not_ready",
                "database": "down",
                "timestamp": timezone.now().isoformat(),
            },
            status=503,
        )

    return JsonResponse(
        {
            "status": "ready",
            "database": "up",
            "timestamp": timezone.now().isoformat(),
        }
    )
