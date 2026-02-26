"""Patient CRUD endpoints — scoped to the user's clinic."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_admin
from app.schemas.patient import PatientCreate, PatientRead, PatientUpdate

router = APIRouter(prefix="/patients", tags=["patients"])


def _require_clinic(user: dict[str, Any]) -> str:
    """Extract clinic_id or raise 403."""
    clinic_id = user.get("clinic_id")
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes pertenecer a una clínica para gestionar pacientes",
        )
    return clinic_id


@router.post("/", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(
    body: PatientCreate,
    user: dict[str, Any] = Depends(get_current_user),
) -> PatientRead:
    """Register a new patient in the user's clinic."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    data = {
        **body.model_dump(exclude_none=True),
        "clinic_id": clinic_id,
    }

    result = sb.table("patients").insert(data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el paciente",
        )

    return PatientRead(**result.data[0])


@router.get("/", response_model=list[PatientRead])
async def list_patients(
    user: dict[str, Any] = Depends(get_current_user),
    search: str | None = Query(None, description="Buscar por nombre"),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[PatientRead]:
    """List patients of the current clinic (paginated, optional search)."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    query = (
        sb.table("patients")
        .select("*")
        .eq("clinic_id", clinic_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )

    if search:
        # ilike search on first_name or last_name
        query = query.or_(
            f"first_name.ilike.%{search}%,last_name.ilike.%{search}%"
        )

    result = query.execute()
    return [PatientRead(**row) for row in (result.data or [])]


@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> PatientRead:
    """Get a single patient by ID (must belong to user's clinic)."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    result = (
        sb.table("patients")
        .select("*")
        .eq("id", patient_id)
        .eq("clinic_id", clinic_id)
        .maybe_single()
        .execute()
    )

    if result.data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )

    return PatientRead(**result.data)


@router.patch("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: str,
    body: PatientUpdate,
    user: dict[str, Any] = Depends(get_current_user),
) -> PatientRead:
    """Update patient data."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay campos para actualizar",
        )

    result = (
        sb.table("patients")
        .update(update_data)
        .eq("id", patient_id)
        .eq("clinic_id", clinic_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado o no pertenece a tu clínica",
        )

    return PatientRead(**result.data[0])


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> None:
    """Delete a patient record."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    result = (
        sb.table("patients")
        .delete()
        .eq("id", patient_id)
        .eq("clinic_id", clinic_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado o no pertenece a tu clínica",
        )
