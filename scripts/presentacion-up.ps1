Set-Location "$PSScriptRoot\.."
docker compose -f docker-compose.prototype.yml up --build -d
Write-Host "Frontend: http://localhost:8080"
Write-Host "Backend API: http://localhost:8000/api/v1/"
Write-Host "Healthz: http://localhost:8000/healthz/"
Write-Host "Readyz: http://localhost:8000/readyz/"
