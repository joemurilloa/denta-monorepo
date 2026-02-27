from __future__ import annotations
from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel

class BookingBase(BaseModel):
    patient_name: str
    patient_phone: str
    reason: Optional[str] = None
    requested_date: date
    requested_time: time

class BookingCreate(BookingBase):
    doctor_id: str

class BookingRead(BookingBase):
    id: str
    clinic_id: str
    doctor_id: str
    status: str # pending, confirmed, rejected
    created_at: datetime
    updated_at: Optional[datetime] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None

class BookingUpdate(BaseModel):
    status: str
