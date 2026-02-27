# Script de inicio para DentaApp
$ErrorActionPreference = "Continue"

Write-Host "🚀 Iniciando DentaApp..." -ForegroundColor Cyan

# --- 1. CONFIGURAR BACKEND ---
Write-Host "`n[1/2] Preparando Backend..." -ForegroundColor Yellow
$repoRoot = $PSScriptRoot
$serverDir = "$repoRoot\denta-server"

if (-not (Test-Path $serverDir)) {
    Write-Host "❌ No se encontrando la carpeta denta-server" -ForegroundColor Red
    exit
}

Set-Location $serverDir

# Detectar VENV
$venvPath = ""
if (Test-Path ".venv") {
    $venvPath = ".\.venv"
}
if (Test-Path "..\.venv") {
    $venvPath = "..\.venv"
}

if ($venvPath -eq "") {
    Write-Host "📦 Creando entorno virtual..." -ForegroundColor Gray
    python -m venv .venv
    $venvPath = ".\.venv"
}

# Activar e instalar
$activateScript = "$venvPath\Scripts\Activate.ps1"
Write-Host "📦 Verificando dependencias..." -ForegroundColor Gray
& $activateScript
pip install -r requirements.txt --quiet

# Lanzar Backend
$backendCmd = "Set-Location '$serverDir'; & '$activateScript'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Host "✅ Backend solicitado en puerto 8000" -ForegroundColor Green

# --- 2. CONFIGURAR FRONTEND ---
Write-Host "`n[2/2] Preparando Frontend..." -ForegroundColor Yellow
$webDir = "$repoRoot\denta-web"

if (-not (Test-Path $webDir)) {
    Write-Host "❌ No se encontró la carpeta denta-web" -ForegroundColor Red
    exit
}

Set-Location $webDir

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando paquetes de Node (esto tarda)..." -ForegroundColor Gray
    npm install
}

# Lanzar Frontend
$frontendCmd = "Set-Location '$webDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Write-Host "✅ Frontend solicitado en puerto 5173" -ForegroundColor Green

# Regresar a la raíz
Set-Location $repoRoot
Write-Host "`n🎉 ¡Listo! Revisa las nuevas ventanas de terminal." -ForegroundColor Magenta
