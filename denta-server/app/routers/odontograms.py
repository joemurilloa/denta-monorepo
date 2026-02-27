"""Odontogram CRUD endpoints."""

from __future__ import annotations

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_admin
from app.schemas.odontogram import OdontogramCreate, OdontogramRead

router = APIRouter(prefix="/odontograms", tags=["odontograms"])


@router.post("", response_model=OdontogramRead, status_code=status.HTTP_201_CREATED)
async def create_odontogram(
    body: OdontogramCreate,
    user: dict[str, Any] = Depends(get_current_user),
) -> OdontogramRead:
    """Create a new odontogram record for a patient."""
    sb = get_supabase_admin()
    
    clinic_id = user.get("clinic_id")
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere una clínica para registrar odontogramas",
        )

    data = {
        **body.model_dump(),
        "clinic_id": clinic_id,
        "visit_date": body.visit_date.isoformat(),
    }

    try:
        result = sb.table("odontograms").insert(data).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving to database: {e}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo guardar el odontograma",
        )

    return OdontogramRead(**result.data[0])


@router.get("/patient/{patient_id}", response_model=List[OdontogramRead])
async def list_patient_odontograms(
    patient_id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> List[OdontogramRead]:
    """Get all odontogram records for a specific patient."""
    sb = get_supabase_admin()
    
    clinic_id = user.get("clinic_id")
    
    result = (
        sb.table("odontograms")
        .select("*")
        .eq("patient_id", patient_id)
        .eq("clinic_id", clinic_id)
        .order("visit_date", desc=True)
        .execute()
    )
    
    return [OdontogramRead(**o) for o in (result.data or [])]


@router.get("/{id}", response_model=OdontogramRead)
async def get_odontogram(
    id: str,
    user: dict[str, Any] = Depends(get_current_user),
) -> OdontogramRead:
    """Get a single odontogram record."""
    sb = get_supabase_admin()
    clinic_id = user.get("clinic_id")
    
    result = (
        sb.table("odontograms")
        .select("*")
        .eq("id", id)
        .eq("clinic_id", clinic_id)
        .execute()
    )
    
    data = result.data[0] if result.data and len(result.data) > 0 else None
    
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Odontograma no encontrado",
        )
        
    return OdontogramRead(**data)
