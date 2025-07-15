# app/routers/users.py

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, EmailStr
from postgrest.exceptions import APIError
from app.db import supabase

router = APIRouter()

# ─── Pydantic models ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr

class User(UserCreate):
    id: int

# ─── Endpoints ────────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[User])
def list_users():
    """Fetch all users."""
    try:
        res = supabase.table("users").select("*").execute()
    except APIError as e:
        raise HTTPException(500, detail=e.message)
    return res.data

@router.get("", response_model=list[User], include_in_schema=False)
def list_users_noslash():
    return list_users()

@router.get("/{user_id}", response_model=User)
def get_user(user_id: int = Path(..., description="The ID of the user to retrieve")):
    """Fetch a single user by ID."""
    try:
        res = (
            supabase
            .table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(404, detail=e.message)
    if res.data is None:
        raise HTTPException(404, detail="User not found")
    return res.data

@router.post("/", response_model=User, status_code=201)
def create_user(user: UserCreate):
    """Create a new user."""
    payload = user.dict()
    try:
        res = supabase.table("users").insert(payload).execute()
    except APIError as e:
        raise HTTPException(400, detail=e.message)
    created = res.data[0] if isinstance(res.data, list) else res.data
    return created

@router.post("", response_model=User, status_code=201, include_in_schema=False)
def create_user_noslash(user: UserCreate):
    return create_user(user)

@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user: UserCreate):
    """Update an existing user."""
    payload = user.dict()
    try:
        res = (
            supabase
            .table("users")
            .update(payload)
            .eq("id", user_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(404, detail=e.message)
    if not res.data:
        raise HTTPException(404, detail="User not found or nothing to update")
    updated = res.data[0]
    return updated

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int):
    """Delete a user."""
    try:
        res = (
            supabase
            .table("users")
            .delete()
            .eq("id", user_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(404, detail=e.message)
    return
