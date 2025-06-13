from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import supabase

router = APIRouter()

class LeadCreate(BaseModel):
    name: str
    email: str

class Lead(LeadCreate):
    id: int

@router.get("/", response_model=list[Lead])
def list_leads():
    try:
        res = supabase.table("leads").select("*").execute()
        return res.data or []
    except Exception as e:
        # catch any network / parsing / supabase errors
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Lead, status_code=201)
def create_lead(lead: LeadCreate):
    payload = lead.dict()
    try:
        res = supabase.table("leads").insert(payload).execute()
        # expect res.data to be a list of created rows
        data = res.data
        if not isinstance(data, list) or not data:
            raise ValueError("Unexpected response from Supabase")
        return data[0]
    except Exception as e:
        # turn any error into a 400 Bad Request
        raise HTTPException(status_code=400, detail=str(e))

