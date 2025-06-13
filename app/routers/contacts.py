from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.models import Contact, ContactCreate

router = APIRouter()

@router.get("/", response_model=list[Contact])
def list_contacts():
    res = supabase.table("contacts").select("*").execute()
    return res.data

@router.post("/", response_model=Contact, status_code=201)
def create_contact(c: ContactCreate):
    res = supabase.table("contacts").insert(c.dict()).single().execute()
    if hasattr(res, "error") and res.error:
        raise HTTPException(400, res.error.message)
    return res.data
