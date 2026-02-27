"""Multi-tenant middleware — injects clinic_id into request.state."""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.supabase_client import get_supabase_admin

# Paths that do NOT require tenant context
_PUBLIC_PREFIXES = ("/health", "/auth", "/docs", "/openapi.json", "/redoc")


class TenantMiddleware(BaseHTTPMiddleware):
    """Extract ``clinic_id`` from the user's profile and attach to ``request.state``.

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

        # Try to extract clinic_id from Bearer token via Supabase
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                sb = get_supabase_admin()
                user_response = sb.auth.get_user(token)
                user = user_response.user
                if user:
                    request.state.user_id = user.id
                    # Look up clinic_id from profile
                    result = (
                        sb.table("user_profiles")
                        .select("clinic_id")
                        .eq("id", user.id)
                        .execute()
                    )
                    profile = result.data[0] if result.data and len(result.data) > 0 else None
                    if profile:
                        request.state.clinic_id = profile.get("clinic_id")
            except Exception:
                # Let the auth dependency handle the actual 401
                pass

        return await call_next(request)
