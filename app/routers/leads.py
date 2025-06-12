from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LeadCreate(BaseModel):
    name: str
    email: str
    # any other fields…

class Lead(BaseModel):
    id: int
    name: str
    email: str
    # same fields plus any auto-generated ones…

@router.get("/", response_model=list[Lead])
def list_leads():
    res = supabase.table("leads").select("*").execute()
    return res.data

@router.post("/", response_model=Lead, status_code=201)
def create_lead(lead: LeadCreate):
    payload = lead.dict()
    res = supabase.table("leads").insert(payload).single().execute()
    if res.error:
        raise HTTPException(400, res.error.message)
    return res.data
