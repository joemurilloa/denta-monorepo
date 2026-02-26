"""JWT verification and authentication dependencies."""

from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.supabase_client import get_supabase_admin

# Reusable HTTP Bearer scheme shown in OpenAPI docs
_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    """FastAPI dependency — extracts the Bearer token and verifies the user
    via Supabase Admin API (works with both HS256 and ES256 tokens).

    Injects a dict with at least:
      - ``sub``       (Supabase user UUID)
      - ``email``
      - ``clinic_id`` (from user_profiles table)
      - ``role``      (application role)
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Use Supabase Admin to verify the token and get the user
    sb = get_supabase_admin()
    try:
        user_response = sb.auth.get_user(token)
        user = user_response.user
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Look up the user's profile to get clinic_id and role
    profile = None
    try:
        result = (
            sb.table("user_profiles")
            .select("clinic_id, role")
            .eq("id", user.id)
            .maybe_single()
            .execute()
        )
        profile = result.data
    except Exception:
        pass

    user_info: dict[str, Any] = {
        "sub": user.id,
        "email": user.email,
        "clinic_id": profile.get("clinic_id") if profile else None,
        "role": profile.get("role", "dentist") if profile else "dentist",
    }

    # Attach to request.state for downstream middleware/handlers
    request.state.user = user_info
    request.state.clinic_id = user_info["clinic_id"]

    return user_info
