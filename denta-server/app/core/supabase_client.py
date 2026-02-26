"""Supabase client singletons (service-role and anon)."""

from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase_admin() -> Client:
    """Return a Supabase client using the **service_role** key.

    Use this for server-side operations that bypass RLS
    (e.g. creating resources on behalf of any tenant).
    """
    s = get_settings()
    return create_client(s.SUPABASE_URL, s.SUPABASE_SERVICE_ROLE_KEY)


@lru_cache
def get_supabase_anon() -> Client:
    """Return a Supabase client using the **anon** key.

    Use this for auth operations that should respect
    client-side RLS policies (sign-up, sign-in, etc.).
    """
    s = get_settings()
    return create_client(s.SUPABASE_URL, s.SUPABASE_ANON_KEY)
