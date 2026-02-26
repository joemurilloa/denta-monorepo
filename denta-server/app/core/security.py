"""JWT verification and authentication dependencies."""

from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import Settings, get_settings

# Reusable HTTP Bearer scheme shown in OpenAPI docs
_bearer_scheme = HTTPBearer(auto_error=False)


def verify_supabase_jwt(
    token: str,
    settings: Settings | None = None,
) -> dict[str, Any]:
    """Decode and verify a Supabase-issued JWT.

    Returns the full payload dict on success.
    Raises ``HTTPException(401)`` on any failure.
    """
    if settings is None:
        settings = get_settings()

    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    return payload


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    """FastAPI dependency — extracts and verifies the Bearer token.

    Injects a dict with at least:
      - ``sub``       (Supabase user UUID)
      - ``email``
      - ``clinic_id`` (from ``app_metadata`` or ``user_metadata``)
      - ``role``      (application role, NOT Supabase role)

    Usage::

        @router.get("/protected")
        async def protected(user: dict = Depends(get_current_user)):
            ...
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_supabase_jwt(credentials.credentials, settings)

    # Supabase stores custom claims in app_metadata
    app_meta: dict[str, Any] = payload.get("app_metadata", {})
    user_meta: dict[str, Any] = payload.get("user_metadata", {})

    user_info: dict[str, Any] = {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "clinic_id": app_meta.get("clinic_id") or user_meta.get("clinic_id"),
        "role": app_meta.get("role", "dentist"),
    }

    # Attach to request.state for downstream middleware/handlers
    request.state.user = user_info
    request.state.clinic_id = user_info["clinic_id"]

    return user_info
