# app/routers/floor_traffic.py

import logging
from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Query
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db import supabase
from app.models import (
    FloorTrafficCustomer,
    FloorTrafficCustomerCreate,
    FloorTrafficCustomerUpdate,
    MonthMetrics,
)

router = APIRouter()

def _safe_select(cols: list[str]) -> str:
    return "*"

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
        data = res.data or []
        return data if isinstance(data, list) else []
    except APIError as e:
        logging.error("floor_traffic._fetch_range error: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch floor traffic data")

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

    if not payload.get("visit_time") or not payload.get("salesperson"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="visit_time and salesperson are required",
        )

    first = payload.get("first_name")
    last = payload.get("last_name")
    if not first or not last:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
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
        logging.error("create_floor_traffic insert error: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion failed, no data returned."
        )

    created = res.data[0]

    try:
        supabase.table("contacts").insert({
            "name": created.get("customer_name"),
            "email": created.get("email"),
            "phone": created.get("phone"),
        }).execute()
    except APIError:
        logging.warning("Failed to insert contact record; continuing without halting.")

    return created

@router.put("/{entry_id}", response_model=FloorTrafficCustomer)
async def update_floor_traffic(entry_id: int, entry: FloorTrafficCustomerUpdate):
    payload = {k: v for k, v in jsonable_encoder(entry).items() if v is not None}
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    try:
        res = (
            supabase.table("floor_traffic_customers")
            .update(payload)
            .eq("id", entry_id)
            .execute()
        )
    except APIError as e:
        logging.error("update_floor_traffic error: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return res.data[0]

@router.get(
    "/month-metrics",
    response_model=MonthMetrics,
    summary="Return month-to-date sales performance metrics.",
)
async def month_metrics():
    today = date.today()
    start = datetime.combine(today.replace(day=1), datetime.min.time())
    # Handle December → January edge-case
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)

    try:
        res = (
            supabase
            .table("floor_traffic_customers")
            .select("*")
            .gte("visit_time", start.isoformat())
            .lt("visit_time", end.isoformat())
            .execute()
        )
        rows = res.data or []
    except APIError as e:
        logging.error("floor_traffic.month_metrics query failed: %s", e)
        return MonthMetrics(
            total_customers=0,
            demo_count=0,
            worksheet_count=0,
            customer_offer_count=0,
            sold_count=0
        )

    total = len(rows)
    demo = sum(1 for r in rows if r.get("demo"))
    worksheet = sum(1 for r in rows if any(r.get(k) for k in ["worksheet", "write_up", "worksheet_complete"]))
    customer_offer = sum(1 for r in rows if r.get("customer_offer"))
    sold = sum(1 for r in rows if r.get("sold"))

    return MonthMetrics(
        total_customers=total,
        demo_count=demo,
        worksheet_count=worksheet,
        customer_offer_count=customer_offer,
        sold_count=sold,
    )
