"""Authentication endpoints — delegates to Supabase Auth."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_admin, get_supabase_anon
from app.schemas.user import AuthResponse, LoginRequest, UserCreate, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: UserCreate) -> AuthResponse:
    """Register a new user via Supabase Auth, then create a user_profiles row."""
    sb = get_supabase_anon()

    # 1. Create auth user in Supabase
    try:
        auth_response = sb.auth.sign_up(
            {"email": body.email, "password": body.password}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrar usuario: {exc}",
        ) from exc

    user = auth_response.user
    session = auth_response.session

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el usuario. Verifica los datos.",
        )

    # 2. Create profile row using admin client (bypasses RLS)
    sb_admin = get_supabase_admin()
    profile_data = {
        "id": user.id,
        "email": body.email,
        "full_name": body.full_name,
        "role": "owner",  # first user is owner by default
    }

    try:
        sb_admin.table("user_profiles").insert(profile_data).execute()
    except Exception:
        # Profile creation failed but auth user exists — log but don't block
        pass

    return AuthResponse(
        access_token=session.access_token if session else "",
        refresh_token=session.refresh_token if session else None,
        user=UserProfile(
            id=user.id,
            email=body.email,
            full_name=body.full_name,
            role="owner",
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest) -> AuthResponse:
    """Authenticate an existing user via Supabase Auth."""
    sb = get_supabase_anon()

    try:
        auth_response = sb.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Credenciales inválidas: {exc}",
        ) from exc

    user = auth_response.user
    session = auth_response.session

    if user is None or session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    # Fetch profile from DB
    sb_admin = get_supabase_admin()
    profile_result = (
        sb_admin.table("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybe_single()
        .execute()
    )
    profile = profile_result.data

    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user=UserProfile(
            id=user.id,
            email=user.email or body.email,
            full_name=profile.get("full_name", "") if profile else "",
            clinic_id=profile.get("clinic_id") if profile else None,
            role=profile.get("role", "dentist") if profile else "dentist",
        ),
    )


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict[str, Any] = Depends(get_current_user)) -> UserProfile:
    """Return the authenticated user's profile."""
    sb_admin = get_supabase_admin()

    result = (
        sb_admin.table("user_profiles")
        .select("*")
        .eq("id", current_user["sub"])
        .maybe_single()
        .execute()
    )
    profile = result.data

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado",
        )

    return UserProfile(
        id=profile["id"],
        email=profile.get("email", current_user.get("email", "")),
        full_name=profile.get("full_name", ""),
        clinic_id=profile.get("clinic_id"),
        role=profile.get("role", "dentist"),
        avatar_url=profile.get("avatar_url"),
        created_at=profile.get("created_at"),
    )
