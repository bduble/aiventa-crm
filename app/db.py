# app/db.py

import os
import logging
from dotenv import load_dotenv
from supabase import create_client

# 1️⃣ Load your .env (SUPABASE_URL, SUPABASE_KEY)
load_dotenv()

# 2️⃣ Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 3️⃣ Grab env vars
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
)
# Prefer the service role key when available

# 4️⃣ Sanity-check logging (only show first few chars of the key)
logger.info(f"🔍 SUPABASE_URL = {SUPABASE_URL!r}")
if SUPABASE_KEY:
    logger.info(f"🔍 SUPABASE_KEY = {SUPABASE_KEY[:5]}…")
else:
    logger.error("🔑 SUPABASE_KEY is not set in your environment!")

# 5️⃣ Create the Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
