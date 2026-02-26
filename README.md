# DentaApp — SaaS PWA para Consultorios Dentales

> Plataforma multi-tenant para gestión integral de clínicas dentales: agenda, expedientes, odontogramas, facturación e inventario.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 · Vite 5 · PWA (vite-plugin-pwa) · Tailwind CSS · shadcn/ui |
| **State** | Zustand · TanStack React Query |
| **Backend** | FastAPI · Python 3.11 · SQLAlchemy 2.x |
| **BaaS** | Supabase (Auth · PostgreSQL · Storage · Realtime) |
| **Infra** | Docker · docker-compose · Nginx |

## Estructura del Monorepo

```
denta-monorepo/
├── denta-server/   # API FastAPI
├── denta-web/      # PWA React + Vite
├── docs/           # Documentación adicional
├── docker-compose.yml
└── .env.example
```

## Requisitos Previos

- **Docker ≥ 24** y **Docker Compose ≥ 2.20** (recomendado)
- O alternativamente: **Node.js ≥ 20** · **Python ≥ 3.11** · **pnpm** (o npm)
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

## Inicio Rápido

### Con Docker (recomendado)

```bash
# 1. Clona y entra al repo
git clone <repo-url> && cd denta-monorepo

# 2. Copia variables de entorno
cp .env.example .env
# Edita .env con tus claves de Supabase

# 3. Levanta los servicios
docker-compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Sin Docker

```bash
# Backend
cd denta-server
python -m venv .venv && .venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (otra terminal)
cd denta-web
npm install
npm run dev
```

## Variables de Entorno

Consulta `.env.example` en la raíz y en cada sub-proyecto para ver las variables requeridas.

Referencia detallada de configuración de Supabase: [docs/supabase_setup.md](docs/supabase_setup.md)

## Seguridad

Ver [SECURITY.md](SECURITY.md) para lineamientos de seguridad, manejo de datos sensibles y mejores prácticas.

## Licencia

Privado — Todos los derechos reservados.
