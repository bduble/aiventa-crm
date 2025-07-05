from fastapi import APIRouter, HTTPException, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError
from datetime import date, datetime, timedelta
from app.db import supabase
from app.models import FloorTrafficCustomer, FloorTrafficCustomerCreate

router = APIRouter()

@router.get(
    "/today",
    response_model=list[FloorTrafficCustomer],
    summary="Get today's floor-traffic entries",
)
async def get_today_floor_traffic():
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    try:
        res = (
            supabase
            .table("floor_traffic_customers")
            .select("*")
            .gte("visit_time", start.isoformat())
            .lt("visit_time", end.isoformat())
            .order("visit_time", desc=False)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=500, detail=e.message)

    data = res.data or []
    return data if isinstance(data, list) else []

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

    return res.data[0]
