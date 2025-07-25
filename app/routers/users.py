from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Literal
from postgrest.exceptions import APIError
from app.db import supabase

router = APIRouter()

# ─── Pydantic models ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str = Field(..., alias="name")
    email: EmailStr
    role: Literal["Admin", "Sales", "Manager"] = "Sales"
    model_config = ConfigDict(populate_by_name=True)

class User(BaseModel):
    id: int
    full_name: str = Field(..., alias="name")
    email: EmailStr
    role: Literal["Admin", "Sales", "Manager"]
    model_config = ConfigDict(populate_by_name=True)

# ─── Endpoints ────────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[User])
def list_users():
    try:
        res = supabase.table("users").select("*").execute()
    except APIError as e:
        raise HTTPException(500, detail=e.message)
    return res.data

@router.get("/{user_id}", response_model=User)
def get_user(user_id: str = Path(..., description="The ID of the user to retrieve")):
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

@router.post("/", status_code=201)
def create_user(user: UserCreate):
    payload = user.model_dump(by_alias=True)
    try:
        res = supabase.table("users").insert(payload).execute()
    except APIError as e:
        raise HTTPException(400, detail=e.message)
    created = res.data[0] if isinstance(res.data, list) else res.data
    return created

@router.put("/{user_id}", response_model=User)
def update_user(user_id: str, user: UserCreate):
    payload = user.model_dump(by_alias=True)
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
def delete_user(user_id: str):
    try:
        supabase.table("users").delete().eq("id", user_id).execute()
    except APIError as e:
        raise HTTPException(404, detail=e.message)
    return
