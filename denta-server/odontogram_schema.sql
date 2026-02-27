-- SQL to create the odontograms table
-- Execute this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS odontograms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    teeth JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (simplified for now)
ALTER TABLE odontograms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON odontograms
    FOR ALL USING (auth.role() = 'authenticated');
