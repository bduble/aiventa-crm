# app/routers/floor_traffic.py
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
    if not isinstance(data, list):
        data = []
    return data

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

    # Basic validation
    if not payload.get("visit_time") or not payload.get("salesperson") or not payload.get("customer_name"):
        raise HTTPException(
            status_code=422,
            detail="visit_time, salesperson & customer_name are required",
        )

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
