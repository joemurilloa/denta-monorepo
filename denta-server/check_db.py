import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing")
    exit(1)

supabase: Client = create_client(url, key)

sql = """
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

-- Enable RLS
ALTER TABLE odontograms ENABLE ROW LEVEL SECURITY;

-- Simple policy for authenticated users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'odontograms' AND policyname = 'Allow all for authenticated users'
    ) THEN
        CREATE POLICY "Allow all for authenticated users" ON odontograms
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
"""

try:
    # Use rpc if available for raw sql, or just notice that we might need to do it via dashboard
    # supabase-py doesn't have a direct "run_sql" method, but we can try to use a dummy table
    # or just ask the user to run it.
    # However, since I have the service role, I can try to use 'postgrest' to check if table exists
    res = supabase.table("odontograms").select("count", count="exact").limit(1).execute()
    print("Table 'odontograms' already exists.")
except Exception as e:
    print(f"Table might not exist: {e}")
    print("Please run the SQL in odontogram_schema.sql in your Supabase SQL Editor.")
    print("I have created the file for you.")
