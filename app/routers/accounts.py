from fastapi import APIRouter, HTTPException, status
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import Account, AccountCreate, AccountUpdate

router = APIRouter()


@router.get("/", response_model=list[Account])
@router.get("", response_model=list[Account], include_in_schema=False)
def list_accounts():
    res = supabase.table("accounts").select("*").execute()
    return res.data


@router.get("/{account_id}", response_model=Account)
def get_account(account_id: int):
    res = (
        supabase
        .table("accounts")
        .select("*")
        .eq("id", account_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Account not found")
    return res.data


@router.post("/", response_model=Account, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=Account, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_account(a: AccountCreate):
    try:
        res = supabase.table("accounts").insert(a.dict()).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    # insert returns a list
    return res.data[0]


@router.patch("/{account_id}", response_model=Account)
def update_account(account_id: int, a: AccountUpdate):
    payload = {k: v for k, v in a.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = (
            supabase
            .table("accounts")
            .update(payload)
            .eq("id", account_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Account not found")
    return res.data[0]


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: int):
    try:
        res = (
            supabase
            .table("accounts")
            .delete()
            .eq("id", account_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Account not found")
    return
