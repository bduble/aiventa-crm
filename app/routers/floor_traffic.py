# app/routers/floor_traffic.py
from fastapi import APIRouter, HTTPException, status
from datetime import date, datetime, timedelta
from app.db import supabase
from app.models import (
    FloorTrafficCustomer,
    FloorTrafficCustomerCreate,
)

router = APIRouter(
    prefix="/api/floor-traffic",
    tags=["floor-traffic"],
)

@router.get(
    "/today",
    response_model=list[FloorTrafficCustomer],
    summary="Get today's floor-traffic entries",
)
def get_today_floor_traffic():
    # Compute today's window
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    res = (
        supabase
        .table("floor_traffic_customers")
        .select("*")
        .gte("visit_time", start.isoformat())
        .lt("visit_time", end.isoformat())
        .order("visit_time", desc=False)
        .execute()
    )
    if res.error:
        raise HTTPException(status_code=500, detail=res.error.message)
    return res.data or []


@router.post(
    "/",
    response_model=FloorTrafficCustomer,
    status_code=status.HTTP_201_CREATED,
    summary="Log a new floor-traffic visit",
)
def create_floor_traffic(entry: FloorTrafficCustomerCreate):
    payload = entry.dict(exclude_unset=True)

    # Basic required-field validation
    if not payload.get("visit_time") or not payload.get("salesperson") or not payload.get("customer_name"):
        raise HTTPException(
            status_code=422,
            detail="visit_time, salesperson & customer_name are required",
        )

    res = supabase \
        .table("floor_traffic_customers") \
        .insert(payload) \
        .single() \
        .execute()

    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)

    return res.data
