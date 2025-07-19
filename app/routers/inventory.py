# app/routers/inventory.py

import logging
from fastapi import APIRouter, HTTPException, status, Query
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import InventoryItem, InventoryItemCreate, InventoryItemUpdate

router = APIRouter()

@router.get(
    "/",
    response_model=list[InventoryItem],
    summary="List inventory items with optional filters",
)
def list_inventory(
    make: str | None = Query(None, description="Filter by make"),
    model: str | None = Query(None, description="Filter by model"),
    year_min: int | None = Query(None, description="Minimum year"),
    year_max: int | None = Query(None, description="Maximum year"),
    price_min: float | None = Query(None, description="Minimum selling price"),
    price_max: float | None = Query(None, description="Maximum selling price"),
    mileage_max: int | None = Query(None, description="Maximum mileage"),
    condition: str | None = Query(None, description="Filter by condition"),
    inventory_type: str | None = Query(None, alias="type", description="Filter by type"),
    exterior_color: str | None = Query(None, description="Filter by exterior color"),
    fuel_type: str | None = Query(None, alias="fuelType", description="Filter by fuel type"),
    drivetrain: str | None = Query(None, description="Filter by drivetrain"),
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
    # Use sellingprice column for price filters
    if price_min is not None:
        query = query.gte("sellingprice", price_min)
    if price_max is not None:
        query = query.lte("sellingprice", price_max)
    if mileage_max is not None:
        query = query.lte("mileage", mileage_max)
    if condition:
        query = query.eq("condition", condition)
    if inventory_type:
        # actual column is 'type'
        query = query.eq("type", inventory_type)
    if exterior_color:
        query = query.ilike("exterior_color", f"%{exterior_color}%")
    if fuel_type:
        query = query.eq("fuel_type", fuel_type)
    if drivetrain:
        query = query.eq("drive_type", drivetrain)

    try:
        res = query.execute()
    except APIError as e:
        logging.error("Error listing inventory: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    return res.data or []

# Support '/api/inventory' without trailing slash
@router.get("", include_in_schema=False, response_model=list[InventoryItem])
def list_inventory_noslash(
    make: str | None = Query(None),
    model: str | None = Query(None),
    year_min: int | None = Query(None),
    year_max: int | None = Query(None),
    price_min: float | None = Query(None),
    price_max: float | None = Query(None),
    mileage_max: int | None = Query(None),
    condition: str | None = Query(None),
    inventory_type: str | None = Query(None, alias="type"),
    exterior_color: str | None = Query(None),
    fuel_type: str | None = Query(None, alias="fuelType"),
    drivetrain: str | None = Query(None),
):
    return list_inventory(
        make, model, year_min, year_max, price_min, price_max,
        mileage_max, condition, inventory_type, exterior_color,
        fuel_type, drivetrain
    )

@router.get(
    "/snapshot",
    summary="Return full inventory stats for KPI dashboard, including buckets."
)
def inventory_snapshot():
    try:
        # Only pull "in_stock" vehicles and necessary columns
        res = (
            supabase
            .table("inventory")
            .select("type, \"Days In Stock\", \"StatusCode\"")
            .eq("StatusCode", "in_stock")
            .execute()
        )
    except APIError as e:
        logging.error("Error fetching inventory snapshot: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    rows = res.data or []
    total = len(rows)
    new_count = sum(1 for r in rows if str(r.get("type", "")).lower() == "new")
    used_count = sum(1 for r in rows if str(r.get("type", "")).lower() == "used")

    # Days In Stock stats & buckets
    days_list = [r.get("Days In Stock") for r in rows if r.get("Days In Stock") is not None]
    avg_days = round(sum(days_list) / len(days_list), 1) if days_list else 0
    turn_rate = avg_days  # Adjust if you want a different calculation

    over_thirty = round(
        (sum(1 for d in days_list if d > 30) / len(days_list) * 100) if days_list else 0,
        1
    )

    buckets = {
        "0-30": sum(1 for d in days_list if 0 <= d <= 30),
        "31-45": sum(1 for d in days_list if 31 <= d <= 45),
        "46-60": sum(1 for d in days_list if 46 <= d <= 60),
        "61-90": sum(1 for d in days_list if 61 <= d <= 90),
        "90+": sum(1 for d in days_list if d > 90),
    }

    return {
        "total": total,
        "newCount": new_count,
        "usedCount": used_count,
        "avgDays": avg_days,
        "turnRate": turn_rate,
        "overThirty": over_thirty,
        "buckets": buckets,
    }

@router.get("/{item_id}", response_model=InventoryItem)
def get_inventory_item(item_id: int):
    try:
        res = (
            supabase
            .table("inventory")
            .select("*")
            .eq("id", item_id)
            .maybe_single()
            .execute()
        )
    except APIError as e:
        logging.error("Error fetching inventory item %s: %s", item_id, e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return res.data

@router.post(
    "/",
    response_model=InventoryItem,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory_item(item: InventoryItemCreate):
    payload = item.dict(exclude_unset=True)
    try:
        res = supabase.table("inventory").insert(payload).execute()
    except APIError as e:
        logging.error("Error creating inventory item: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return res.data[0]

# Support POST without trailing slash
@router.post("", include_in_schema=False, response_model=InventoryItem, status_code=status.HTTP_201_CREATED)
def create_inventory_item_noslash(item: InventoryItemCreate):
    return create_inventory_item(item)

@router.put("/{item_id}", response_model=InventoryItem)
def update_inventory_item(item_id: int, item: InventoryItemUpdate):
    payload = {k: v for k, v in item.dict(exclude_unset=True).items() if v is not None}
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    try:
        res = (
            supabase
            .table("inventory")
            .update(payload)
            .eq("id", item_id)
            .execute()
        )
    except APIError as e:
        logging.error("Error updating inventory item %s: %s", item_id, e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return res.data[0]

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(item_id: int):
    try:
        res = supabase.table("inventory").delete().eq("id", item_id).execute()
    except APIError as e:
        logging.error("Error deleting inventory item %s: %s", item_id, e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    # returning None yields a 204 with no content
    return
