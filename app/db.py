# app/db.py

import os
import logging
import re
from dotenv import load_dotenv
from supabase import create_client
from types import SimpleNamespace
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .db_models import Base

# 1️⃣ Load your .env (SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, etc)
load_dotenv()

# 2️⃣ Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db")

# 3️⃣ Environment variables
raw_url = os.getenv("SUPABASE_URL") or ""
# Strip any trailing PostgREST path (e.g. `/rest/v1`) which would cause
# requests to hit `<project-url>/rest/v1/rest/v1/...` and return 404s.
SUPABASE_URL = re.sub(r"/rest/v1/?$", "", raw_url)
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
)
DATABASE_URL = os.getenv("DATABASE_URL")

# 4️⃣ Sanity checks & log startup
logger.info(f"🔍 SUPABASE_URL: {SUPABASE_URL!r}")
if SUPABASE_KEY:
    logger.info(f"🔍 SUPABASE_KEY: {SUPABASE_KEY[:5]}… (masked)")
else:
    logger.warning("🔑 SUPABASE_KEY is not set!")
if not DATABASE_URL or DATABASE_URL.startswith("sqlite"):
    logger.error("🚨 DATABASE_URL not set or is using SQLite! You must use Supabase/Postgres in production.")

# 5️⃣ Supabase client
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    logger.warning("Supabase credentials missing; using in-memory stub")

    class _StubQuery:
        def __getattr__(self, _):
            def method(*args, **kwargs):
                return self
            return method
        def execute(self):
            return SimpleNamespace(data=[], error=None, count=0)
    class _StubClient:
        def table(self, *_args, **_kwargs):
            return _StubQuery()
    supabase = _StubClient()

# 6️⃣ SQLAlchemy setup
if DATABASE_URL and not DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL)
else:
    # Fall back, but warn: only for local dev/test!
    logger.warning("Falling back to in-memory SQLite (NOT for production)")
    engine = create_engine("sqlite:///:memory:")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 7️⃣ Table auto-create (dev/test only!)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables checked/created.")
except Exception as e:
    logger.error(f"Failed creating tables: {e}")

def get_db_session():
    """FastAPI dependency for SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

logger.info(f"🛢️  Using DATABASE_URL: {DATABASE_URL}")
