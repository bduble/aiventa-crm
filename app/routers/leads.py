from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import supabase

router = APIRouter()

class LeadCreate(BaseModel):
    name: str
    email: str

class Lead(BaseModel):
    id: int
    name: str
    email: str

@router.get("/", response_model=list[Lead])
def list_leads():
    res = supabase.table("leads").select("*").execute()
    if res.error:
        raise HTTPException(status_code=500, detail=res.error.message)
    return res.data or []

@router.post("/", response_model=Lead, status_code=201)
def create_lead(lead: LeadCreate):
    payload = lead.dict()
    # insert without .single()
    res = supabase.table("leads").insert(payload).execute()

    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)

    # res.data is a list of inserted records; return the first one
    try:
        created = res.data[0]
    except (IndexError, TypeError):
        raise HTTPException(status_code=500, detail="Failed to retrieve created lead")

    return created
