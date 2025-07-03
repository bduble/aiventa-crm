from fastapi import APIRouter, HTTPException, status
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import InventoryItem, InventoryItemCreate, InventoryItemUpdate

router = APIRouter()

@router.get("/", response_model=list[InventoryItem])
def list_inventory():
    res = supabase.table("inventory").select("*").execute()
    return res.data

@router.get("/{item_id}", response_model=InventoryItem)
def get_inventory_item(item_id: int):
    res = (
        supabase.table("inventory")
        .select("*")
        .eq("id", item_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return res.data

@router.post("/", response_model=InventoryItem, status_code=status.HTTP_201_CREATED)
def create_inventory_item(item: InventoryItemCreate):
    payload = item.dict(exclude_unset=True)
    try:
        res = supabase.table("inventory").insert(payload).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    return res.data[0]

@router.put("/{item_id}", response_model=InventoryItem)
def update_inventory_item(item_id: int, item: InventoryItemUpdate):
    payload = {k: v for k, v in item.dict(exclude_unset=True).items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = (
            supabase.table("inventory")
            .update(payload)
            .eq("id", item_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return res.data[0]

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(item_id: int):
    try:
        res = supabase.table("inventory").delete().eq("id", item_id).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    return
