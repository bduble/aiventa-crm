# app/db.py

import os
import logging
from dotenv import load_dotenv
from supabase import create_client, SupabaseClient

# Pull in .env from your project root
load_dotenv()

# ——— Logging setup —————————————————————————————————————————————————————
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ——— Environment variables ——————————————————————————————————————————————
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Prefer the service role key if you need full access; otherwise fall back to the anon key
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Missing SUPABASE_URL or SUPABASE_KEY in environment")
    raise RuntimeError("🔴 SUPABASE_URL and SUPABASE_KEY must be set in .env")

logger.info(f"🔍 SUPABASE_URL = {SUPABASE_URL!r}")
logger.info(f"🔍 SUPABASE_KEY = {SUPABASE_KEY[:5]}…")  # only log the first few chars

# ——— Supabase client —————————————————————————————————————————————————————
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)
