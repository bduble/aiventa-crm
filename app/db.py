import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# switch this:
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
# or, if you prefer the anon key:
# SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

import os, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

logger.info(f"🔍 SUPABASE_URL = {SUPABASE_URL!r}")
logger.info(f"🔍 SUPABASE_KEY = {SUPABASE_KEY[:5]}…")  # just show first few chars

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
