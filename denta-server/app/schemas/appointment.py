"""Appointment schemas."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class AppointmentCreate(BaseModel):
    """Payload to create a new appointment."""

    patient_id: str
    dentist_id: str
    date_time: datetime
    duration_minutes: int = 30
    treatment_type: str | None = None
    notes: str | None = None
    status: AppointmentStatus = AppointmentStatus.SCHEDULED


class AppointmentRead(BaseModel):
    """Appointment returned to the client."""

    id: str
    clinic_id: str
    patient_id: str
    dentist_id: str
    date_time: datetime
    duration_minutes: int
    treatment_type: str | None = None
    notes: str | None = None
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime | None = None


class AppointmentUpdate(BaseModel):
    """Partial update for an appointment."""

    patient_id: str | None = None
    dentist_id: str | None = None
    date_time: datetime | None = None
    duration_minutes: int | None = None
    treatment_type: str | None = None
    notes: str | None = None
    status: AppointmentStatus | None = None
