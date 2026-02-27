"""Odontogram schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict

from pydantic import BaseModel


class OdontogramBase(BaseModel):
    """Base schema for odontograms."""
    patient_id: str
    visit_date: date
    teeth: Dict[str, Dict[str, str]]
    notes: str | None = None


class OdontogramCreate(OdontogramBase):
    """Payload to create a new odontogram."""
    pass


class OdontogramRead(OdontogramBase):
    """Response schema for odontograms."""
    id: str
    clinic_id: str
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
