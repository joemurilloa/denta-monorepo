"""Clinic CRUD endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_admin
from app.schemas.clinic import ClinicCreate, ClinicRead, ClinicUpdate

router = APIRouter(prefix="/clinics", tags=["clinics"])


@router.post("", response_model=ClinicRead, status_code=status.HTTP_201_CREATED)
async def create_clinic(
    body: ClinicCreate,
    user: dict[str, Any] = Depends(get_current_user),
) -> ClinicRead:
    """Create a new clinic and assign the current user as owner."""
    sb = get_supabase_admin()

    data = {
        **body.model_dump(exclude_none=True),
        "owner_id": user["sub"],
    }

    result = sb.table("clinics").insert(data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear la clínica",
        )

    clinic = result.data[0]

    # Update user profile with the new clinic_id
    sb.table("user_profiles").update(
        {"clinic_id": clinic["id"]}
    ).eq("id", user["sub"]).execute()

    return ClinicRead(**clinic)


@router.get("/me", response_model=ClinicRead)
async def get_my_clinic(
    user: dict[str, Any] = Depends(get_current_user),
) -> ClinicRead:
    """Return the clinic the current user belongs to."""
    sb = get_supabase_admin()
    clinic_id = user.get("clinic_id")

    # If we have a clinic_id, look it up directly
    if clinic_id:
        result = (
            sb.table("clinics")
            .select("*")
            .eq("id", clinic_id)
            .execute()
        )
        data = result.data[0] if result.data and len(result.data) > 0 else None
        if data:
            return ClinicRead(**data)

    # Fallback: look up clinic owned by this user
    owned = (
        sb.table("clinics")
        .select("*")
        .eq("owner_id", user["sub"])
        .limit(1)
        .execute()
    )
    if owned.data and len(owned.data) > 0:
        return ClinicRead(**owned.data[0])

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No tienes una clínica asignada",
    )


@router.patch("/{clinic_id}", response_model=ClinicRead)
async def update_clinic(
    clinic_id: str,
    body: ClinicUpdate,
    user: dict[str, Any] = Depends(get_current_user),
) -> ClinicRead:
    """Update clinic details. Only the owner can update."""
    sb = get_supabase_admin()

    # Verify ownership
    existing = (
        sb.table("clinics")
        .select("owner_id")
        .eq("id", clinic_id)
        .execute()
    )
    existing_data = existing.data[0] if existing.data and len(existing.data) > 0 else None

    if existing_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clínica no encontrada",
        )

    if existing_data["owner_id"] != user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el propietario puede actualizar la clínica",
        )

    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay campos para actualizar",
        )

    result = (
        sb.table("clinics")
        .update(update_data)
        .eq("id", clinic_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al actualizar la clínica",
        )

    return ClinicRead(**result.data[0])
