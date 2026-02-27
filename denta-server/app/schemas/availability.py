from __future__ import annotations
from datetime import time, date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class DoctorAvailabilityBase(BaseModel):
    working_days: List[int] = Field(default=[1, 2, 3, 4, 5], description="1=Mon, 7=Sun")
    start_time: time = Field(default="08:00")
    end_time: time = Field(default="18:00")
    slot_duration_minutes: int = Field(default=30)
    blocked_dates: List[date] = Field(default=[])

class DoctorAvailabilityCreate(DoctorAvailabilityBase):
    pass

class DoctorAvailabilityRead(DoctorAvailabilityBase):
    id: str
    doctor_id: str
    clinic_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class DoctorAvailabilityUpdate(BaseModel):
    working_days: Optional[List[int]] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None
    blocked_dates: Optional[List[date]] = None

class TimeSlot(BaseModel):
    time: str
    available: bool
