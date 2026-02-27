---
description: Guía paso a paso para iniciar DentaApp de forma infalible
---

# Guía de Inicio Infalible (Windows)

Si tienes problemas para iniciar, sigue estos pasos exactamente.

## Opción A: Inicio Automático (Recomendado)

He creado un script que hace todo por ti.

1. Abre una terminal de **PowerShell** en la carpeta raíz del proyecto (`denta-monorepo`).
2. Ejecuta:
   ```powershell
   .\iniciar.ps1
   ```
   *Si te da error de permisos, ejecuta primero:* `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

---

## Opción B: Inicio Manual (Paso a Paso)

Sigue estos pasos en el orden exacto.

### 1. El Backend (Servidor)
Abre una terminal y ve a la carpeta del servidor:

```powershell
cd denta-server
# Activar el entorno virtual (asumiendo que está en denta-server/.venv)
& .\.venv\Scripts\Activate.ps1
# Instalar dependencias por si acaso
pip install -r requirements.txt
# Iniciar server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. El Frontend (Cliente)
Abre **OTRA** terminal y ve a la carpeta del web:

```powershell
cd denta-web
# Instalar dependencias si es la primera vez
npm install
# Iniciar cliente
npm run dev
```

---

## Solución de Problemas Comunes

### Error: "Puerto 8000 ya está en uso"
Ejecuta esto en PowerShell para liberar el puerto:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force
```

### Error: "uvicorn no se reconoce"
Asegúrate de haber activado el entorno virtual (`Activate.ps1`) antes de ejecutar el comando.

### Error: "npm no se reconoce"
Debes tener instalado Node.js. [Descárgalo aquí](https://nodejs.org/).
