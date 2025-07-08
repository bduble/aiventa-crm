import os
from typing import Optional
from app.db import supabase
import openai

_openai_client: Optional[openai.AsyncOpenAI] = None


def _load_key_from_supabase() -> Optional[str]:
    """Fetch OPENAI_API_KEY from the Supabase 'settings' table."""
    try:
        res = (
            supabase.table("settings")
            .select("value")
            .eq("key", "OPENAI_API_KEY")
            .single()
            .execute()
        )
        if res.data and isinstance(res.data, dict):
            return res.data.get("value")
    except Exception:
        pass
    return None


def get_openai_client() -> Optional[openai.AsyncOpenAI]:
    """Return a cached AsyncOpenAI client if configured."""
    global _openai_client
    if _openai_client:
        return _openai_client

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        api_key = _load_key_from_supabase()

    if api_key:
        _openai_client = openai.AsyncOpenAI(api_key=api_key)
    return _openai_client
