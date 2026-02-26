import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(".env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")

sb: Client = create_client(url, key)

EMAIL = "test@example.com"
PASSWORD = "password123"

def test_login():
    try:
        print(f"Attempting login for {EMAIL}...")
        res = sb.auth.sign_in_with_password({
            "email": EMAIL,
            "password": PASSWORD
        })
        print("✅ Login successful!")
        print(f"User ID: {res.user.id}")
        print(f"Access Token: {res.session.access_token[:20]}...")
    except Exception as e:
        print(f"❌ Login failed: {e}")

if __name__ == "__main__":
    test_login()
