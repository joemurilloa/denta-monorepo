"""Patient schemas."""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class PatientCreate(BaseModel):
    """Payload to register a new patient."""

    first_name: str
    last_name: str
    date_of_birth: date | None = None
    gender: Gender | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    insurance_provider: str | None = None
    insurance_number: str | None = None
    allergies: str | None = None
    notes: str | None = None


class PatientRead(BaseModel):
    """Patient record returned to the client."""

    id: str
    clinic_id: str
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    gender: Gender | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    insurance_provider: str | None = None
    insurance_number: str | None = None
    allergies: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class PatientUpdate(BaseModel):
    """Partial update payload for a patient."""

    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    insurance_provider: str | None = None
    insurance_number: str | None = None
    allergies: str | None = None
    notes: str | None = None
