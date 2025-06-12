# app/routers/leads.py

from fastapi import APIRouter, HTTPException
from postgrest import APIError
from app.db import supabase

router = APIRouter()

@router.get("/leads/")
def list_leads():
    try:
        resp = supabase.table("leads").select("*").execute()
        return resp.data
    except APIError as e:
        # e.args[0] is usually the JSON error object from PostgREST
        raise HTTPException(status_code=500, detail=e.args[0])
