from fastapi import APIRouter, HTTPException, status, Query
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import Contact, ContactCreate, ContactUpdate

router = APIRouter()

@router.get("/", response_model=list[Contact])
@router.get("", response_model=list[Contact], include_in_schema=False)
def list_contacts(
    q: str | None = Query(None, description="Search term for name"),
    email: str | None = Query(None, description="Filter by email"),
    phone: str | None = Query(None, description="Filter by phone"),
):
    """List contacts with optional search filters."""
    query = supabase.table("contacts").select("*")
    if q:
        query = query.ilike("name", f"%{q}%")
    if email:
        query = query.ilike("email", f"%{email}%")
    if phone:
        query = query.ilike("phone", f"%{phone}%")

    res = query.execute()
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
@router.post("", response_model=Contact, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_contact(c: ContactCreate):
    try:
        res = supabase.table("contacts").insert(c.dict()).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    return res.data[0]

@router.patch("/{contact_id}", response_model=Contact)
def update_contact(contact_id: int, c: ContactUpdate):
    payload = {k: v for k, v in c.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = (
            supabase
            .table("contacts")
            .update(payload)
            .eq("id", contact_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return res.data[0]

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int):
    try:
        res = (
            supabase
            .table("contacts")
            .delete()
            .eq("id", contact_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return
