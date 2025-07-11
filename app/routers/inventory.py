# app/routers/inventory.py

from fastapi import APIRouter, HTTPException, status, Query
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import InventoryItem, InventoryItemCreate, InventoryItemUpdate

router = APIRouter()

@router.get("/", response_model=list[InventoryItem])
def list_inventory(
    make: str | None = Query(None),
    model: str | None = Query(None),
    year_min: int | None = Query(None),
    year_max: int | None = Query(None),
    price_min: float | None = Query(None),
    price_max: float | None = Query(None),
    mileage_max: int | None = Query(None),
    condition: str | None = Query(None),
    color: str | None = Query(None),
    fuel_type: str | None = Query(None, alias="fuelType"),
    drivetrain: str | None = Query(None),
):
    """
    List inventory items with optional filters.
    """
    query = supabase.table("inventory").select("*")

    if make:
        query = query.ilike("make", f"%{make}%")
    if model:
        query = query.ilike("model", f"%{model}%")
    if year_min is not None:
        query = query.gte("year", year_min)
    if year_max is not None:
        query = query.lte("year", year_max)
    if price_min is not None:
        query = query.gte("price", price_min)
    if price_max is not None:
        query = query.lte("price", price_max)
    if mileage_max is not None:
        query = query.lte("mileage", mileage_max)
    if condition:
        query = query.eq("condition", condition)
    if color:
        query = query.ilike("color", f"%{color}%")
    if fuel_type:
        query = query.eq("fuel_type", fuel_type)
    if drivetrain:
        query = query.eq("drivetrain", drivetrain)

    try:
        res = query.execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    return res.data or []


# Support '/api/inventory' without trailing slash
@router.get("", response_model=list[InventoryItem], include_in_schema=False)
def list_inventory_noslash():
    return list_inventory()


@router.get("/snapshot")
def inventory_snapshot():
    """
    Return basic counts of total, active, and inactive inventory.
    """
    try:
        # select all rows so we can count active vs inactive
        res = supabase.table("inventory").select("*").execute()
    except APIError as e:
        raise HTTPException(status_code=500, detail=e.message)

    rows = res.data or []
    total = len(rows)
    active_count = sum(1 for r in rows if r.get("active") is True)
    inactive_count = total - active_count

    return {
        "total": total,
        "active": active_count,
        "inactive": inactive_count,
    }


@router.get("/{item_id}", response_model=InventoryItem)
def get_inventory_item(item_id: int):
    """
    Fetch a single inventory item by ID.
    """
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
    """
    Insert a new inventory item.
    """
    payload = item.dict(exclude_unset=True)
    try:
        res = supabase.table("inventory").insert(payload).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    return res.data[0]


# Support '/api/inventory' POST without trailing slash
@router.post("", response_model=InventoryItem, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_inventory_item_noslash(item: InventoryItemCreate):
    return create_inventory_item(item)


@router.put("/{item_id}", response_model=InventoryItem)
def update_inventory_item(item_id: int, item: InventoryItemUpdate):
    """
    Update fields of an existing inventory item.
    """
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
    """
    Delete an inventory item by ID.
    """
    try:
        res = supabase.table("inventory").delete().eq("id", item_id).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Item not found")
    # returning None yields a 204 with no content
    return
