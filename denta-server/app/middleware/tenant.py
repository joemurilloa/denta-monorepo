"""Multi-tenant middleware — injects clinic_id into request.state."""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import get_settings
from app.core.security import verify_supabase_jwt

# Paths that do NOT require tenant context
_PUBLIC_PREFIXES = ("/health", "/auth", "/docs", "/openapi.json", "/redoc")


class TenantMiddleware(BaseHTTPMiddleware):
    """Extract ``clinic_id`` from JWT and attach to ``request.state``.

    Public routes are skipped — the auth dependency handles
    authentication; this middleware only adds tenant context
    for convenience in downstream handlers.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        path = request.url.path

        # Skip public routes
        if any(path.startswith(p) for p in _PUBLIC_PREFIXES):
            return await call_next(request)

        # Try to extract clinic_id from Bearer token
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                payload = verify_supabase_jwt(token, get_settings())
                app_meta = payload.get("app_metadata", {})
                user_meta = payload.get("user_metadata", {})
                request.state.clinic_id = (
                    app_meta.get("clinic_id") or user_meta.get("clinic_id")
                )
                request.state.user_id = payload.get("sub")
            except Exception:
                # Let the auth dependency handle the actual 401
                pass

        return await call_next(request)
