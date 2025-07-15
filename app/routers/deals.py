# app/routers/deals.py
from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError
from app.db import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class DealCreate(BaseModel):
    customer_id: int
    vehicle: Optional[str]
    trade: Optional[str]
    amount: Optional[float]
    stage: Optional[str] = "new"
    status: Optional[str]
    notes: Optional[str]
    salesperson: Optional[str]
    sold: Optional[bool]
    close_date: Optional[str]

class Deal(DealCreate):
    id: int

@router.get("/", response_model=list[Deal])
def list_deals(customer_id: Optional[int] = None):
    try:
        query = supabase.table("deals").select("*")
        if customer_id:
            query = query.eq("customer_id", customer_id)
        res = query.execute()
        return res.data or []
    except APIError as e:
        raise HTTPException(400, detail=e.message)

@router.post("/", response_model=Deal)
def create_deal(deal: DealCreate):
    try:
        res = supabase.table("deals").insert(deal.dict()).execute()
        return res.data[0]
    except APIError as e:
        raise HTTPException(400, detail=e.message)
