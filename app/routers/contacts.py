from fastapi import APIRouter, HTTPException, status
from app.db import supabase
from app.models import Contact, ContactCreate, ContactUpdate

router = APIRouter()

@router.get("/", response_model=list[Contact])
def list_contacts():
    res = supabase.table("contacts").select("*").execute()
    return res.data

@router.get("/{contact_id}", response_model=Contact)
def get_contact(contact_id: int):
    res = (
        supabase
        .table("contacts")
        .select("*")
        .eq("id", contact_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return res.data

@router.post("/", response_model=Contact, status_code=status.HTTP_201_CREATED)
def create_contact(c: ContactCreate):
    res = supabase.table("contacts").insert(c.dict()).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    return res.data[0]

@router.patch("/{contact_id}", response_model=Contact)
def update_contact(contact_id: int, c: ContactUpdate):
    payload = {k: v for k, v in c.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = (
        supabase
        .table("contacts")
        .update(payload)
        .eq("id", contact_id)
        .execute()
    )
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return res.data[0]

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int):
    res = (
        supabase
        .table("contacts")
        .delete()
        .eq("id", contact_id)
        .execute()
    )
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return
