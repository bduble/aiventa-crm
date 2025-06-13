from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import supabase

router = APIRouter()

class LeadCreate(BaseModel):
    name: str
    email: str

class LeadUpdate(BaseModel):
    name: str | None = None
    email: str | None = None

class Lead(BaseModel):
    id: int
    name: str
    email: str

@router.get("/", response_model=list[Lead])
def list_leads():
    res = supabase.table("leads").select("*").execute()
    return res.data

@router.get("/{id}", response_model=Lead)
def get_lead(id: int):
    res = supabase.table("leads").select("*").eq("id", id).single().execute()
    if not res.data:
        raise HTTPException(404, f"Lead {id} not found")
    return res.data

@router.post("/", response_model=Lead, status_code=201)
def create_lead(lead: LeadCreate):
    res = supabase.table("leads").insert(lead.dict()).execute()
    if res.error:
        raise HTTPException(400, res.error.message)
    return res.data[0]

@router.patch("/{id}", response_model=Lead)
def update_lead(id: int, updates: LeadUpdate):
    payload = {k: v for k, v in updates.dict().items() if v is not None}
    if not payload:
        raise HTTPException(400, "No fields to update")
    res = supabase.table("leads").update(payload).eq("id", id).execute()
    if res.error:
        raise HTTPException(400, res.error.message)
    if not res.data:
        raise HTTPException(404, f"Lead {id} not found")
    return res.data[0]

@router.delete("/{id}", status_code=204)
def delete_lead(id: int):
    res = supabase.table("leads").delete().eq("id", id).execute()
    if res.error:
        raise HTTPException(400, res.error.message)
    if res.count == 0:
        raise HTTPException(404, f"Lead {id} not found")
    return
