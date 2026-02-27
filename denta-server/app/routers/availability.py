from datetime import date, datetime, time, timedelta
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_admin
from app.schemas.availability import (
    DoctorAvailabilityCreate,
    DoctorAvailabilityRead,
    DoctorAvailabilityUpdate,
    TimeSlot,
)

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("/me", response_model=DoctorAvailabilityRead)
async def get_my_availability(
    user: dict[str, Any] = Depends(get_current_user),
) -> DoctorAvailabilityRead:
    """Get the current doctor's availability settings."""
    sb = get_supabase_admin()
    
    # Use standard execute() instead of maybe_single() to avoid library bugs
    try:
        result = (
            sb.table("doctor_availability")
            .select("*")
            .eq("doctor_id", user["sub"])
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    # Manual single record logic
    data = result.data[0] if result.data and len(result.data) > 0 else None

    if not data:
        return DoctorAvailabilityRead(
            id="temp",
            doctor_id=user["sub"],
            clinic_id=user["clinic_id"] or "none",
            working_days=[1, 2, 3, 4, 5],
            start_time=time(8, 0),
            end_time=time(18, 0),
            slot_duration_minutes=30,
            blocked_dates=[],
            created_at=datetime.now(),
        )

    return DoctorAvailabilityRead(**data)

@router.put("/me", response_model=DoctorAvailabilityRead)
async def update_my_availability(
    body: DoctorAvailabilityUpdate,
    user: dict[str, Any] = Depends(get_current_user),
) -> DoctorAvailabilityRead:
    """Update or create the doctor's availability settings."""
    if not user.get("clinic_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere una clínica para configurar disponibilidad",
        )

    sb = get_supabase_admin()
    
    # Check if exists
    existing_res = (
        sb.table("doctor_availability")
        .select("id")
        .eq("doctor_id", user["sub"])
        .execute()
    )
    existing_data = existing_res.data[0] if existing_res.data and len(existing_res.data) > 0 else None
# ... (omitted similar changes to speed up)

    data = body.model_dump(exclude_none=True)
    if "start_time" in data: data["start_time"] = data["start_time"].strftime("%H:%M")
    if "end_time" in data: data["end_time"] = data["end_time"].strftime("%H:%M")
    if "blocked_dates" in data: data["blocked_dates"] = [d.isoformat() for d in data["blocked_dates"]]

    if existing_data:
        result = (
            sb.table("doctor_availability")
            .update({**data, "updated_at": "now()"})
            .eq("id", existing_data["id"])
            .execute()
        )
    else:
        result = (
            sb.table("doctor_availability")
            .insert({
                **data,
                "doctor_id": user["sub"],
                "clinic_id": user["clinic_id"]
            })
            .execute()
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo guardar la disponibilidad",
        )

    return DoctorAvailabilityRead(**result.data[0])


@router.get("/slots/{doctor_id}", response_model=List[TimeSlot])
async def list_available_slots(
    doctor_id: str,
    target_date: date = Query(..., description="Fecha para consultar slots"),
) -> List[TimeSlot]:
    """Public endpoint to list available slots for a doctor on a specific date."""
    sb = get_supabase_admin()
    
    # 1. Get doctor settings
    config_res = (
        sb.table("doctor_availability")
        .select("*")
        .eq("doctor_id", doctor_id)
        .execute()
    )
    config = config_res.data[0] if config_res.data and len(config_res.data) > 0 else None
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El doctor no tiene configurada su disponibilidad",
        )
    
    
    # 2. Check if date is blocked or not a working day
    # ISO weekday: Monday is 1, Sunday is 7
    weekday = target_date.isoweekday()
    if weekday not in config["working_days"]:
        return []
    
    if target_date.isoformat() in config.get("blocked_dates", []):
        return []

    # 3. Get existing bookings and confirmed appointments
    # We check both confirmed appointments and pending bookings to avoid double booking
    bookings_res = (
        sb.table("bookings")
        .select("requested_time")
        .eq("doctor_id", doctor_id)
        .eq("requested_date", target_date.isoformat())
        .neq("status", "rejected")
        .execute()
    )
    
    appointments_res = (
        sb.table("appointments")
        .select("date_time")
        .eq("dentist_id", doctor_id)
        .eq("status", "confirmed")
        .execute()
    )
    
    occupied_times = set()
    for b in (bookings_res.data or []):
        occupied_times.add(b["requested_time"][:5]) # Store as "HH:MM"
        
    for a in (appointments_res.data or []):
        dt = datetime.fromisoformat(a["date_time"].replace("Z", "+00:00"))
        if dt.date() == target_date:
            occupied_times.add(dt.strftime("%H:%M"))

    # 4. Generate slots
    slots = []
    start_str = config["start_time"]
    end_str = config["end_time"]
    duration = config["slot_duration_minutes"]
    
    current_dt = datetime.combine(target_date, time.fromisoformat(start_str))
    end_dt = datetime.combine(target_date, time.fromisoformat(end_str))
    
    # Don't show past slots if date is today
    now = datetime.now()
    
    while current_dt < end_dt:
        time_str = current_dt.strftime("%H:%M")
        
        is_available = time_str not in occupied_times
        
        # Check if slot is in the past
        if target_date == now.date() and current_dt < now:
            is_available = False
            
        slots.append(TimeSlot(time=time_str, available=is_available))
        current_dt += timedelta(minutes=duration)
        
    return slots
