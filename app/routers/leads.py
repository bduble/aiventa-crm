from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, EmailStr
from typing import List
from app.db import supabase

router = APIRouter()

class LeadCreate(BaseModel):
    name: str
    email: EmailStr

class Lead(BaseModel):
    id: int
    name: str
    email: EmailStr

@router.get("/", response_model=List[Lead])
def list_leads():
    res = supabase.table("leads").select("*").execute()
    return res.data

@router.get("/{lead_id}", response_model=Lead)
def get_lead(lead_id: int = Path(..., gt=0)):
    res = supabase.table("leads").select("*").eq("id", lead_id).single().execute()
    if not res.data:
        raise HTTPException(404, f"Lead with id={lead_id} not found")
    return res.data

@router.post("/", response_model=Lead, status_code=201)
def create_lead(lead: LeadCreate):
    payload = lead.dict()
    res = supabase.table("leads").insert(payload).single().execute()
    if hasattr(res, "error") and res.error:
        raise HTTPException(400, res.error.message)
    return res.data

@router.put("/{lead_id}", response_model=Lead)
def update_lead(lead_id: int = Path(..., gt=0), lead: LeadCreate = None):
    payload = lead.dict()
    res = (
        supabase.table("leads")
        .update(payload)
        .eq("id", lead_id)
        .select("*")
        .single()
        .execute()
    )
    if hasattr(res, "error") and res.error:
        raise HTTPException(400, res.error.message)
    if not res.data:
        raise HTTPException(404, f"Lead with id={lead_id} not found")
    return res.data

@router.delete("/{lead_id}", status_code=204)
def delete_lead(lead_id: int = Path(..., gt=0)):
    res = supabase.table("leads").delete().eq("id", lead_id).execute()
    if hasattr(res, "error") and res.error:
        raise HTTPException(400, res.error.message)
    if res.count == 0:
        raise HTTPException(404, f"Lead with id={lead_id} not found")
    return
