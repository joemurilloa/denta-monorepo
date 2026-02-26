"""Clinic schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr


class ClinicCreate(BaseModel):
    """Payload to create a new clinic."""

    name: str
    address: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    logo_url: str | None = None


class ClinicRead(BaseModel):
    """Clinic returned to the client."""

    id: str
    owner_id: str
    name: str
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    logo_url: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class ClinicUpdate(BaseModel):
    """Partial update payload for a clinic."""

    name: str | None = None
    address: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    logo_url: str | None = None
