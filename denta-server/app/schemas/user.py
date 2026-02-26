"""User / profile schemas."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    """Application-level roles (stored in app_metadata / user_profiles)."""

    OWNER = "owner"
    DENTIST = "dentist"
    ASSISTANT = "assistant"
    RECEPTIONIST = "receptionist"


class UserCreate(BaseModel):
    """Payload sent by the client to register a new user."""

    email: EmailStr
    password: str
    full_name: str


class UserProfile(BaseModel):
    """User profile returned from the API."""

    id: str
    email: str
    full_name: str
    clinic_id: str | None = None
    role: UserRole = UserRole.DENTIST
    avatar_url: str | None = None
    created_at: datetime | None = None


class LoginRequest(BaseModel):
    """Email + password login payload."""

    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Tokens returned after sign-up or login."""

    access_token: str
    refresh_token: str | None = None
    user: UserProfile
