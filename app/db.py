# app/db.py
from dotenv import load_dotenv
load_dotenv()            # ← make sure this is *before* any os.environ[...] uses

import os
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
