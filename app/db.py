# app/db.py
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()   # <-- this loads .env, .env.* etc

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase      = create_client(SUPABASE_URL, SUPABASE_KEY)
