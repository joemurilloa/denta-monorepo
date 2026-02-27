@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   Iniciando DentaApp - Script de Rescate
echo ==========================================

:: 1. Backend
echo [1/2] Iniciando Backend...
cd /d "%~dp0denta-server"

:: Detectar VENV
set VENV_ACTIVATE=""
if exist ".venv\Scripts\activate.bat" (
    set VENV_ACTIVATE=".venv\Scripts\activate.bat"
) else if exist "..\.venv\Scripts\activate.bat" (
    set VENV_ACTIVATE="..\.venv\Scripts\activate.bat"
)

if !VENV_ACTIVATE! == "" (
    echo Creando entorno virtual...
    python -m venv .venv
    set VENV_ACTIVATE=".venv\Scripts\activate.bat"
)

:: Iniciar en nueva ventana
start "DentaApp - Backend" cmd /k "cd /d "%~dp0denta-server" && call !VENV_ACTIVATE! && pip install -r requirements.txt --quiet && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: 2. Frontend
echo [2/2] Iniciando Frontend...
cd /d "%~dp0denta-web"

if not exist "node_modules" (
    echo Instalando paquetes de Node - esto puede tardar
    npm install
)

:: Iniciar en nueva ventana
start "DentaApp - Frontend" cmd /k "cd /d "%~dp0denta-web" && npm run dev"

echo.
echo Todo listo. Revisa las nuevas ventanas abiertas.
echo.
timeout /t 5
