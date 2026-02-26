import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(".env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
sb: Client = create_client(url, key)

EMAIL = "test@example.com"

def dump_data():
    # Auth
    user = next((u for u in sb.auth.admin.list_users() if u.email == EMAIL), None)
    if not user:
        print("User not found")
        return
    
    print(f"User ID: {user.id}")
    
    # Profile
    profile = sb.table("user_profiles").select("*").eq("id", user.id).execute()
    print(f"Profile: {profile.data}")
    
    # Role
    role = p = profile.data[0].get("role") if profile.data else None
    print(f"Role: {role}")

    # Check patients count for this clinic
    clinic_id = profile.data[0].get("clinic_id") if profile.data else None
    if clinic_id:
        patients = sb.table("patients").select("id").eq("clinic_id", clinic_id).execute()
        print(f"Patients in this clinic: {len(patients.data)}")
    else:
        print("No clinic_id in profile.")

if __name__ == "__main__":
    dump_data()
