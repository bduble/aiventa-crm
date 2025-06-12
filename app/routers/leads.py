from fastapi import APIRouter, HTTPException
from app.db import supabase

router = APIRouter()

@router.get("/leads/")
def list_leads():
    res = supabase.table("leads").select("*").execute()
    # if something went wrong, res.error will be truthy
    if res.error:
        # you can log res.error.message or raise an HTTPException
        raise HTTPException(status_code=500, detail=res.error.message)
    return res.data  # this is your list of rows

