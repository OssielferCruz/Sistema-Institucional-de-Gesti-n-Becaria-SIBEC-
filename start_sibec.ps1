$projectRoot = "c:\Users\fernd\OneDrive\Desktop\PROYECTO SIBEC\Desarrollar aplicación web SIBEC"
$backendPath = "$projectRoot\backend"
$pythonPath = "c:\Users\fernd\OneDrive\Desktop\PROYECTO SIBEC\.venv\Scripts\python.exe"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      Iniciando Entorno SIBEC             " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "1. Levantando Backend (Django)..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '$pythonPath' manage.py runserver"

Write-Host "2. Levantando Frontend (React/Vite)..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; npm run dev"

Write-Host ""
Write-Host "¡Servidores iniciados en ventanas separadas!" -ForegroundColor Yellow
Write-Host "-> Podras ver la app en: http://localhost:5173" -ForegroundColor Cyan
Write-Host "-> Credenciales rápidas:"
Write-Host "     Admin: bienestar.estudiantil@ulsa.edu.ni (Admin123456!)"
Write-Host "     Otros: jefatura.ice@ulsa.edu.ni | roberto.mendez@ac.ulsa.edu.ni | juan.perez@est.ulsa.edu.ni (Demo123456!)"
Write-Host "==========================================" -ForegroundColor Cyan
