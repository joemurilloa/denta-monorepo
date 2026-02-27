@echo off
echo ==========================================
echo   Apagando DentaApp...
echo ==========================================

echo [1/2] Matando proceso del Backend (Puerto 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo [2/2] Matando proceso del Frontend (Puerto 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul

echo.
echo ✅ Todo apagado correctamente.
echo.
pause
