-- ═══════════════════════════════════════════════════════════════
-- DentaApp — 001 Initial Schema
-- Ejecutar en Supabase SQL Editor (supabase.com → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════

-- ── Tipos ENUM ───────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('owner', 'dentist', 'assistant', 'receptionist');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE appointment_status AS ENUM (
    'scheduled', 'confirmed', 'in_progress',
    'completed', 'cancelled', 'no_show'
);

-- ── 1. CLINICS ───────────────────────────────────────────────
CREATE TABLE clinics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    address     TEXT,
    phone       TEXT,
    email       TEXT,
    logo_url    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ
);

-- Índice para buscar clínicas por dueño
CREATE INDEX idx_clinics_owner ON clinics(owner_id);

-- ── 2. USER_PROFILES ─────────────────────────────────────────
CREATE TABLE user_profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT NOT NULL,
    clinic_id   UUID REFERENCES clinics(id) ON DELETE SET NULL,
    role        user_role NOT NULL DEFAULT 'dentist',
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para buscar usuarios por clínica
CREATE INDEX idx_user_profiles_clinic ON user_profiles(clinic_id);

-- ── 3. PATIENTS ──────────────────────────────────────────────
CREATE TABLE patients (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    first_name          TEXT NOT NULL,
    last_name           TEXT NOT NULL,
    date_of_birth       DATE,
    gender              gender_type,
    phone               TEXT,
    email               TEXT,
    address             TEXT,
    insurance_provider  TEXT,
    insurance_number    TEXT,
    allergies           TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ
);

-- Índice para buscar pacientes por clínica + nombre
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_name ON patients(clinic_id, last_name, first_name);

-- ── 4. APPOINTMENTS ──────────────────────────────────────────
CREATE TABLE appointments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dentist_id        UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date_time         TIMESTAMPTZ NOT NULL,
    duration_minutes  INT NOT NULL DEFAULT 30,
    treatment_type    TEXT,
    notes             TEXT,
    status            appointment_status NOT NULL DEFAULT 'scheduled',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ
);

-- Índices para queries frecuentes
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(clinic_id, date_time);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_dentist ON appointments(dentist_id);

-- ── 5. TRIGGER: Auto-crear user_profile al registrarse ──────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario')
    );
    RETURN NEW;
END;
$$;

-- Disparar cuando un usuario se registra en auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ── 6. FUNCIÓN updated_at automático ─────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_clinics_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
