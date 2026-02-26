import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load root .env
load_dotenv(".env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env")
    exit(1)

sb: Client = create_client(url, key)

EMAIL = "test@example.com"

def diagnose():
    print(f"--- Diagnosing user: {EMAIL} ---")
    
    # 1. Check Auth
    users = sb.auth.admin.list_users()
    user = next((u for u in users if u.email == EMAIL), None)
    
    if not user:
        print("❌ User NOT found in Supabase Auth.")
        return
    
    print(f"✅ User found in Auth. ID: {user.id}")
    
    # 2. Check user_profiles
    profile = sb.table("user_profiles").select("*").eq("id", user.id).execute()
    if not profile.data:
        print("❌ Profile NOT found in user_profiles table.")
    else:
        p = profile.data[0]
        print(f"✅ Profile found. Data: {p}")
        
    # 3. Check Clinic association
    if profile.data and p.get("clinic_id"):
        clinic = sb.table("clinics").select("*").eq("id", p["clinic_id"]).execute()
        if not clinic.data:
            print(f"❌ Clinic ID {p['clinic_id']} referenced in profile but NOT found in clinics table.")
        else:
            print(f"✅ Clinic found: {clinic.data[0]['name']}")
    else:
        print("ℹ️ User has no clinic_id associated in profile.")

if __name__ == "__main__":
    try:
        diagnose()
    except Exception as e:
        print(f"An error occurred: {e}")
