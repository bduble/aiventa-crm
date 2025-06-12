from fastapi import APIRouter, HTTPException
from app.db import supabase

router = APIRouter()

@router.get("/leads/")
def list_leads():
    res = supabase.table("leads").select("*").execute()
    # check status_code instead of `res.error`
    if res.status_code != 200:
        raise HTTPException(
            status_code=res.status_code,
            detail=res.status_text or "Error fetching leads"
        )
    return res.data
