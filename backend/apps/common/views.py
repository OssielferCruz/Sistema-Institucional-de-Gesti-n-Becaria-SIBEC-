from django.db import connections
from django.http import JsonResponse
from django.utils import timezone


def healthcheck(request):
    """Basic liveness/readiness probe for deployments."""
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
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
