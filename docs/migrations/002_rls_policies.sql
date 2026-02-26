-- ═══════════════════════════════════════════════════════════════
-- DentaApp — 002 Row Level Security Policies
-- Ejecutar en Supabase SQL Editor DESPUÉS de 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ── Habilitar RLS en todas las tablas ────────────────────────
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- CLINICS — Solo el owner puede ver/editar su clínica
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Owner can view own clinic"
    ON clinics FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Owner can create clinic"
    ON clinics FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update own clinic"
    ON clinics FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete own clinic"
    ON clinics FOR DELETE
    USING (owner_id = auth.uid());

-- Miembros de la clínica también pueden verla
CREATE POLICY "Clinic members can view clinic"
    ON clinics FOR SELECT
    USING (
        id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

-- ═══════════════════════════════════════════════════════════════
-- USER_PROFILES — Ver compañeros de la misma clínica
-- ═══════════════════════════════════════════════════════════════

-- Un usuario puede ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

-- Un usuario puede ver perfiles de su misma clínica
CREATE POLICY "Users can view same clinic profiles"
    ON user_profiles FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

-- Un usuario puede editar su propio perfil
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid());

-- El trigger handle_new_user necesita INSERT (service_role lo maneja)
-- No necesita política porque usa SECURITY DEFINER

-- ═══════════════════════════════════════════════════════════════
-- PATIENTS — Solo visible para miembros de la misma clínica
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Clinic members can view patients"
    ON patients FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Clinic members can create patients"
    ON patients FOR INSERT
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Clinic members can update patients"
    ON patients FOR UPDATE
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

-- Solo owners pueden eliminar pacientes
CREATE POLICY "Owners can delete patients"
    ON patients FOR DELETE
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- ═══════════════════════════════════════════════════════════════
-- APPOINTMENTS — Solo visible para miembros de la misma clínica
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Clinic members can view appointments"
    ON appointments FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Clinic members can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Clinic members can update appointments"
    ON appointments FOR UPDATE
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete appointments"
    ON appointments FOR DELETE
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid() AND role = 'owner'
        )
    );
