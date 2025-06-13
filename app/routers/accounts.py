from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.models import Account, AccountCreate

router = APIRouter()

@router.get("/", response_model=list[Account])
def list_accounts():
    res = supabase.table("accounts").select("*").execute()
    return res.data

@router.post("/", response_model=Account, status_code=201)
def create_account(acc: AccountCreate):
    res = supabase.table("accounts").insert(acc.dict()).single().execute()
    if hasattr(res, "error") and res.error:
        raise HTTPException(400, res.error.message)
    return res.data
