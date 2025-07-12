from fastapi import APIRouter, HTTPException, status, Query
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError
from datetime import date, datetime, timedelta
from app.db import supabase
from app.models import (
    FloorTrafficCustomer,
    FloorTrafficCustomerCreate,
    FloorTrafficCustomerUpdate,
)

router = APIRouter()

async def _fetch_range(start: date, end: date):
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end, datetime.min.time()) + timedelta(days=1)

    try:
        res = (
            supabase
            .table("floor_traffic_customers")
            .select("*")
            .gte("visit_time", start_dt.isoformat())
            .lt("visit_time", end_dt.isoformat())
            .order("visit_time", desc=False)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=500, detail=e.message)

    data = res.data or []
    return data if isinstance(data, list) else []


@router.get(
    "/today",
    response_model=list[FloorTrafficCustomer],
    summary="Get today's floor-traffic entries",
)
async def get_today_floor_traffic():
    today = date.today()
    return await _fetch_range(today, today)


@router.get(
    "/search",
    response_model=list[FloorTrafficCustomer],
    summary="Search floor-traffic by date range",
)
async def search_floor_traffic(
    start: date | None = Query(None, description="Start date (YYYY-MM-DD)"),
    end: date | None = Query(None, description="End date (YYYY-MM-DD)"),
):
    if start is None and end is None:
        start = end = date.today()
    elif start is None:
        start = end
    elif end is None:
        end = start

    return await _fetch_range(start, end)

@router.get(
    "/",
    response_model=list[FloorTrafficCustomer],
    summary="Alias for today's entries",
)
async def get_today_alias():
    return await get_today_floor_traffic()

@router.post(
    "/",
    response_model=FloorTrafficCustomer,
    status_code=status.HTTP_201_CREATED,
    summary="Log a new visitor",
)
async def create_floor_traffic(entry: FloorTrafficCustomerCreate):
    payload = jsonable_encoder(entry)

    # Required fields
    if not payload.get("visit_time") or not payload.get("salesperson"):
        raise HTTPException(
            status_code=422,
            detail="visit_time and salesperson are required",
        )
    # Build customer_name from first_name and last_name
    first = payload.get("first_name")
    last = payload.get("last_name")
    if not first or not last:
        raise HTTPException(
            status_code=422,
            detail="first_name and last_name are required",
        )
    payload["customer_name"] = f"{first.strip()} {last.strip()}"

    try:
        res = (
            supabase
            .table("floor_traffic_customers")
            .insert(payload)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    if not res.data:
        raise HTTPException(
            status_code=500,
            detail="Database insertion failed, no data returned."
        )

    created = res.data[0]

    # Also create a contact record for the customer. Ignore errors so the
    # floor-traffic entry is saved even if the contact already exists or the
    # insert fails for some other reason.
    try:
        supabase.table("contacts").insert(
            {
                "name": created["customer_name"],
                "email": created.get("email"),
                "phone": created.get("phone"),
            }
        ).execute()
    except APIError as e:
        logging.warning("Failed to insert contact record: %s", e)

    return created


@router.put("/{entry_id}", response_model=FloorTrafficCustomer)
def update_floor_traffic(entry_id: int, entry: FloorTrafficCustomerUpdate):
    payload = {
        k: v for k, v in jsonable_encoder(entry).items() if v is not None
    }
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = (
            supabase.table("floor_traffic_customers")
            .update(payload)
            .eq("id", entry_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return res.data[0]


@router.get("/month-metrics")
def month_metrics():
    """Return month-to-date sales performance metrics."""
    today = date.today()
    start = datetime.combine(today.replace(day=1), datetime.min.time())
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)

    try:
        res = (
            supabase.table("floor_traffic_customers")
            .select(
                "demo, worksheet, write_up, worksheet_complete, worksheetComplete, writeUp, sold"
            )
            .gte("visit_time", start.isoformat())
            .lt("visit_time", end.isoformat())
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=500, detail=e.message)

    rows = res.data or []
    total = len(rows)
    demo = sum(1 for r in rows if r.get("demo"))
    writeup = sum(
        1
        for r in rows
        if r.get("worksheet")
        or r.get("write_up")
        or r.get("writeUp")
        or r.get("worksheet_complete")
        or r.get("worksheetComplete")
    )
    sold = sum(1 for r in rows if r.get("sold"))

    return {
        "total_customers": total,
        "demo_count": demo,
        "write_up_count": writeup,
        "sold_count": sold,
    }
