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
    inventory_type: str | None = Query(None, alias="type", description="Filter by type"),
    exterior_color: str | None = Query(None, description="Filter by exterior color"),
    fuel_type: str | None = Query(None, alias="fuelType", description="Filter by fuel type"),
    drivetrain: str | None = Query(None, description="Filter by drivetrain"),
):
    """
    List inventory items with optional filters.
    """
    query = supabase.table("inventory_with_days_in_stock").select("*")

    if make:
        query = query.ilike("make", f"%{make}%")
    if model:
        query = query.ilike("model", f"%{model}%")
    if year_min is not None:
        query = query.gte("year", year_min)
    if year_max is not None:
        query = query.lte("year", year_max)
    if price_min is not None:
        query = query.gte("sellingprice", price_min)
    if price_max is not None:
        query = query.lte("sellingprice", price_max)
    if mileage_max is not None:
        query = query.lte("mileage", mileage_max)
    if inventory_type:
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
    inventory_type: str | None = Query(None, alias="type"),
    exterior_color: str | None = Query(None),
    fuel_type: str | None = Query(None, alias="fuelType"),
    drivetrain: str | None = Query(None),
):
    return list_inventory(
        make, model, year_min, year_max, price_min, price_max,
        mileage_max, inventory_type, exterior_color,
        fuel_type, drivetrain
    )

@router.get("/snapshot")
def inventory_snapshot():
    """Return new/used inventory stats and bucket counts."""
    try:
        res = supabase.table("inventory_with_days_in_stock").select("*").execute()
        data = res.data or []
    except APIError as e:
        logging.error("Error fetching inventory for snapshot: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch inventory")

    new_cars = [rec for rec in data if str(rec.get("type", "")).lower() == "new"]
    used_cars = [rec for rec in data if str(rec.get("type", "")).lower() == "used"]

    return {
        "new": summarize_inventory(new_cars),
        "used": summarize_inventory(used_cars)
    }

# --------- BUCKETED FULL SNAPSHOT (for dashboard) -----------
def bucket_days(days):
    if days is None:
        return None
    if days <= 30:
        return "0-30"
    elif days <= 45:
        return "31-45"
    elif days <= 60:
        return "46-60"
    elif days <= 90:
        return "61-90"
    else:
        return "90+"

def summarize_inventory(records):
    out = {
        "total": 0,
        "avgDays": 0,
        "turnRate": 0,  # You can customize this calculation.
        "buckets": {"0-30": 0, "31-45": 0, "46-60": 0, "61-90": 0, "90+": 0}
    }
    if not records:
        return out

    days_list = []
    for rec in records:
        # Accept several possible keys for 'Days In Stock'
        days = (
            rec.get("Days In Stock") or
            rec.get("days_in_stock") or
            rec.get("days_in_stock_dup") or
            rec.get("days_in_stock") or
            rec.get("days_in_stock_dup") or
            rec.get("DaysInStock")
        )
        if days is None:
            continue
        try:
            days = int(days)
        except Exception:
            continue
        days_list.append(days)
        bucket = bucket_days(days)
        if bucket:
            out["buckets"][bucket] += 1

    out["total"] = len(records)
    out["avgDays"] = round(sum(days_list) / len(days_list), 1) if days_list else 0
    out["turnRate"] = round(out["total"] / (sum(days_list) or 1), 2) if days_list else 0  # crude logic!
    return out

@router.get("/snapshot-full")
def inventory_snapshot_full():
    """Return new/used inventory stats and bucket counts."""
    try:
        res = supabase.table("inventory_with_days_in_stock").select("*").execute()
        data = res.data or []
    except APIError as e:
        logging.error("Error fetching inventory for snapshot: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch inventory")

    new_cars = [rec for rec in data if str(rec.get("type", "")).lower() == "new"]
    used_cars = [rec for rec in data if str(rec.get("type", "")).lower() == "used"]

    return {
        "new": summarize_inventory(new_cars),
        "used": summarize_inventory(used_cars)
    }

@router.get("/{item_id}", response_model=InventoryItem)
def get_inventory_item(item_id: int):
    try:
        res = (
            supabase
            .table("inventory_with_days_in_stock")
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
    return
