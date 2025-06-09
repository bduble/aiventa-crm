# backend/app/routers/leads.py
from fastapi import APIRouter, HTTPException
from ..db import supabase

router = APIRouter(prefix="/leads", tags=["leads"])

@router.get("/")
async def list_leads():
    result = supabase.table("leads").select("*").execute()
    if result.error:
        raise HTTPException(status_code=500, detail=result.error.message)
    return result.data

@router.post("/")
async def create_lead(lead: dict):
    result = supabase.table("leads").insert(lead).execute()
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    # return the newly created record
    return result.data[0]
