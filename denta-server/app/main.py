"""DentaApp API — FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.middleware.tenant import TenantMiddleware
from app.routers import appointments, auth, availability, bookings, clinics, health, patients, odontograms


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown lifecycle hook."""
    settings = get_settings()
    print(f"🦷 DentaApp API v0.1.0 starting on :{settings.BACKEND_PORT}")
    print(f"   DEBUG={settings.DEBUG}  CORS={settings.cors_origins}")
    yield
    print("🦷 DentaApp API shutting down…")


def create_app() -> FastAPI:
    """Application factory."""
    settings = get_settings()

    app = FastAPI(
        title="DentaApp API",
        description="API REST para gestión de consultorios dentales — multi-tenant SaaS",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS (must be added BEFORE tenant so it runs FIRST — LIFO) ──
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Tenant middleware ─────────────────────────────────────
    app.add_middleware(TenantMiddleware)

    # ── Routers ───────────────────────────────────────────────
    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(clinics.router)
    app.include_router(patients.router)
    app.include_router(appointments.router)
    app.include_router(availability.router)
    app.include_router(bookings.router)
    app.include_router(odontograms.router)

    return app


# Module-level instance used by uvicorn: `uvicorn app.main:app`
app = create_app()
