from fastapi import APIRouter, HTTPException, status
from datetime import date, datetime, timedelta
from app.db import supabase
from app.models import (
    FloorTrafficCustomer,
    FloorTrafficCustomerCreate,
    FloorTrafficCustomerUpdate,
)

router = APIRouter(tags=["floor-traffic"])

@router.get("/", response_model=list[FloorTrafficCustomer])
def list_floor_traffic(date_str: date | None = None):
    # default to today
    d = date_str or date.today()
    start = datetime.combine(d, datetime.min.time())
    end = start + timedelta(days=1)
    res = (
        supabase.table("floor_traffic_customers")
        .select("*")
        .gte("visit_time", start.isoformat())
        .lt("visit_time", end.isoformat())
        .order("visit_time", desc=False)
        .execute()
    )
    if res.error:
        raise HTTPException(500, res.error.message)
    return res.data or []

@router.post("/", response_model=FloorTrafficCustomer, status_code=status.HTTP_201_CREATED)
def create_floor_customer(f: FloorTrafficCustomerCreate):
    payload = f.dict(exclude_unset=True)
    res = supabase.table("floor_traffic_customers").insert(payload).single().execute()
    if res.error:
        raise HTTPException(400, res.error.message)
    return res.data

@router.patch("/{cust_id}", response_model=FloorTrafficCustomer)
def update_floor_customer(cust_id: int, f: FloorTrafficCustomerUpdate):
    payload = {k: v for k, v in f.dict().items() if v is not None}
    if not payload:
        raise HTTPException(400, "No fields to update")
    res = (
        supabase.table("floor_traffic_customers")
        .update(payload)
        .eq("id", cust_id)
        .single()
        .execute()
    )
    if res.error:
        raise HTTPException(400, res.error.message)
    return res.data

@router.delete("/{cust_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_floor_customer(cust_id: int):
    res = supabase.table("floor_traffic_customers").delete().eq("id", cust_id).execute()
    if res.error:
        raise HTTPException(400, res.error.message)
    return
