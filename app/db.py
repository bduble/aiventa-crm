# app/db.py
import os
from dotenv import load_dotenv

# load local .env (this does nothing in Render, since there is no .env there)
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

from supabase import create_client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
