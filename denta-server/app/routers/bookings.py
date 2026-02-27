from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.core.supabase_client import get_supabase_admin
from app.schemas.booking import BookingCreate, BookingRead, BookingUpdate

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking_request(body: BookingCreate) -> BookingRead:
    """Public endpoint for patients to request a booking."""
    sb = get_supabase_admin()
    
    # Get clinic_id for the doctor
    doctor_res = (
        sb.table("user_profiles")
        .select("clinic_id")
        .eq("id", body.doctor_id)
        .execute()
    )
    doctor_data = doctor_res.data[0] if doctor_res.data and len(doctor_res.data) > 0 else None
    
    if not doctor_data or not doctor_data.get("clinic_id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El doctor o clínica no fue encontrado",
        )
    
    clinic_id = doctor_data["clinic_id"]

    data = {
        **body.model_dump(),
        "clinic_id": clinic_id,
        "requested_date": body.requested_date.isoformat(),
        "requested_time": body.requested_time.strftime("%H:%M"),
        "status": "pending",
    }

    result = sb.table("bookings").insert(data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo procesar la solicitud de cita",
        )

    return BookingRead(**result.data[0])


@router.get("/me", response_model=List[BookingRead])
async def list_my_bookings(
    user: dict[str, Any] = Depends(get_current_user),
) -> List[BookingRead]:
    """Get list of booking requests for the current doctor."""
    sb = get_supabase_admin()
    result = (
        sb.table("bookings")
        .select("*")
        .eq("doctor_id", user["sub"])
        .order("requested_date", desc=True)
        .order("requested_time", desc=True)
        .execute()
    )
    
    return [BookingRead(**b) for b in (result.data or [])]


@router.patch("/{booking_id}", response_model=BookingRead)
async def update_booking_status(
    booking_id: str,
    body: BookingUpdate,
    user: dict[str, Any] = Depends(get_current_user),
) -> BookingRead:
    """Confirm or reject a booking request. If confirmed, an appointment is created."""
    sb = get_supabase_admin()
    
    existing_res = (
        sb.table("bookings")
        .select("*")
        .eq("id", booking_id)
        .execute()
    )
    existing_data = existing_res.data[0] if existing_res.data and len(existing_res.data) > 0 else None
    
    if not existing_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud de cita no encontrada",
        )
        
    if existing_data["doctor_id"] != user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para gestionar esta cita",
        )

    # Update status
    try:
        update_res = (
            sb.table("bookings")
            .update({"status": body.status, "updated_at": "now()"})
            .eq("id", booking_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la solicitud: {e}"
        )
    
    if not update_res.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo actualizar la solicitud de cita"
        )
    
    booking = update_res.data[0]

    # If confirmed, create a real appointment
    if body.status == "confirmed":
        # We need to find or create a patient record first? 
        # For now, we'll just create the appointment with notes about the new patient
        # or we could try to find a patient with the same phone/email.
        
        # 1. Try to find existing patient by phone
        patient_res = (
            sb.table("patients")
            .select("id")
            .eq("clinic_id", booking["clinic_id"])
            .eq("phone", booking["patient_phone"])
            .execute()
        )
        
        patient_id = None
        if patient_res.data and len(patient_res.data) > 0:
            patient_id = patient_res.data[0]["id"]
        else:
            # Create a basic patient record
            names = booking["patient_name"].split(" ", 1)
            first = names[0]
            last = names[1] if len(names) > 1 else ""
            
            new_patient = (
                sb.table("patients")
                .insert({
                    "clinic_id": booking["clinic_id"],
                    "first_name": first,
                    "last_name": last,
                    "phone": booking["patient_phone"],
                })
                .execute()
            )
            if new_patient.data:
                patient_id = new_patient.data[0]["id"]

        if patient_id:
            # Create the appointment
            # Combine date and time
            time_str = booking['requested_time']
            if len(time_str) == 5: # HH:MM
                time_str += ":00"
            dt_str = f"{booking['requested_date']}T{time_str}"
            
            try:
                sb.table("appointments").insert({
                    "clinic_id": booking["clinic_id"],
                    "patient_id": patient_id,
                    "dentist_id": user["sub"],
                    "date_time": dt_str,
                    "status": "confirmed",
                    "notes": f"Cita agendada vía web. Motivo: {booking.get('reason', 'N/A')}",
                }).execute()
            except Exception as e:
                # Log error but don't fail the whole request if appointment creation fails?
                # Actually, better to fail so we can retry.
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error al crear la cita definitiva: {e}"
                )

    # Attach clinic info for the frontend (WhatsApp etc)
    try:
        clinic_res = sb.table("clinics").select("name, address").eq("id", booking["clinic_id"]).execute()
        if clinic_res.data:
            booking["clinic_name"] = clinic_res.data[0].get("name")
            booking["clinic_address"] = clinic_res.data[0].get("address")
    except Exception:
        pass # Not critical

    return BookingRead(**booking)
