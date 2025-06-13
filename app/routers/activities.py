from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.models import Activity, ActivityCreate

router = APIRouter()

@router.get("/", response_model=list[Activity])
def list_activities():
    res = supabase.table("activities").select("*").execute()
    return res.data

@router.post("/", response_model=Activity, status_code=201)
def create_activity(a: ActivityCreate):
    res = supabase.table("activities").insert(a.dict()).single().execute()
    if hasattr(res, "error") and res.error:
        raise HTTPException(400, res.error.message)
    return res.data
