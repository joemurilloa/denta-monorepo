"""Appointment CRUD endpoints — scoped to the user's clinic."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_admin
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentStatus,
    AppointmentUpdate,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _require_clinic(user: dict[str, Any]) -> str:
    """Extract clinic_id or raise 403."""
    clinic_id = user.get("clinic_id")
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes pertenecer a una clínica para gestionar citas",
        )
    return clinic_id


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    body: AppointmentCreate,
    user: dict[str, Any] = Depends(get_current_user),
) -> AppointmentRead:
    """Create a new appointment in the user's clinic."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    data = {
        **body.model_dump(mode="json", exclude_none=True),
        "clinic_id": clinic_id,
    }

    result = sb.table("appointments").insert(data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear la cita",
        )

    return AppointmentRead(**result.data[0])


@router.get("", response_model=list[AppointmentRead])
async def list_appointments(
    user: dict[str, Any] = Depends(get_current_user),
    patient_id: str | None = Query(None, description="Filtrar por paciente"),
    dentist_id: str | None = Query(None, description="Filtrar por dentista"),
    status_filter: AppointmentStatus | None = Query(
        None, alias="status", description="Filtrar por estado"
    ),
    date_from: str | None = Query(None, description="Fecha desde (ISO 8601)"),
    date_to: str | None = Query(None, description="Fecha hasta (ISO 8601)"),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> list[AppointmentRead]:
    """List appointments with optional filters (paginated)."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    query = (
        sb.table("appointments")
        .select("*, patients(first_name, last_name)")
        .eq("clinic_id", clinic_id)
        .order("date_time", desc=False)
        .range(offset, offset + limit - 1)
    )

    if patient_id:
        query = query.eq("patient_id", patient_id)
    if dentist_id:
        query = query.eq("dentist_id", dentist_id)
    if status_filter:
        query = query.eq("status", status_filter.value)
    if date_from:
        query = query.gte("date_time", date_from)
    if date_to:
        query = query.lte("date_time", date_to)

    result = query.execute()
    
    appointments = []
    for row in (result.data or []):
        patient = row.get("patients")
        if patient:
            row["patient_name"] = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
        appointments.append(AppointmentRead(**row))
        
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentRead)
async def get_appointment(
    appointment_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> AppointmentRead:
    """Get a single appointment by ID."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    result = (
        sb.table("appointments")
        .select("*, patients(first_name, last_name)")
        .eq("id", appointment_id)
        .eq("clinic_id", clinic_id)
        .execute()
    )
    data = result.data[0] if result.data and len(result.data) > 0 else None

    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada",
        )

    patient = data.get("patients")
    if patient:
        data["patient_name"] = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()

    return AppointmentRead(**data)


@router.patch("/{appointment_id}", response_model=AppointmentRead)
async def update_appointment(
    appointment_id: str,
    body: AppointmentUpdate,
    user: dict[str, Any] = Depends(get_current_user),
) -> AppointmentRead:
    """Update an appointment (reschedule, change status, etc.)."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    update_data = body.model_dump(mode="json", exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay campos para actualizar",
        )

    result = (
        sb.table("appointments")
        .update(update_data)
        .eq("id", appointment_id)
        .eq("clinic_id", clinic_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada o no pertenece a tu clínica",
        )

    return AppointmentRead(**result.data[0])


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> None:
    """Cancel/delete an appointment."""
    clinic_id = _require_clinic(user)
    sb = get_supabase_admin()

    result = (
        sb.table("appointments")
        .delete()
        .eq("id", appointment_id)
        .eq("clinic_id", clinic_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita no encontrada o no pertenece a tu clínica",
        )
