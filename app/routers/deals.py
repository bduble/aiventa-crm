# app/routers/deals.py
from fastapi import APIRouter, HTTPException, status
from postgrest.exceptions import APIError
from app.db import supabase
from typing import Optional
from app.models import Deal, DealCreate, DealUpdate

router = APIRouter()

@router.get("/", response_model=list[Deal])
@router.get("", response_model=list[Deal], include_in_schema=False)
def list_deals(customer_id: Optional[int] = None):
    try:
        query = supabase.table("deals").select("*")
        if customer_id:
            query = query.eq("customer_id", customer_id)
        res = query.execute()
        return res.data or []
    except APIError as e:
        raise HTTPException(400, detail=e.message)

@router.post("/", response_model=Deal, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=Deal, include_in_schema=False, status_code=status.HTTP_201_CREATED)
def create_deal(deal: DealCreate):
    try:
        res = supabase.table("deals").insert(deal.dict()).execute()
        return res.data[0]
    except APIError as e:
        raise HTTPException(400, detail=e.message)


@router.get("/{deal_id}", response_model=Deal)
def get_deal(deal_id: int):
    try:
        res = (
            supabase
            .table("deals")
            .select("*")
            .eq("id", deal_id)
            .maybe_single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")
    return res.data


@router.patch("/{deal_id}", response_model=Deal)
def update_deal(deal_id: int, deal: DealUpdate):
    payload = {k: v for k, v in deal.dict(exclude_unset=True).items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = (
            supabase
            .table("deals")
            .update(payload)
            .eq("id", deal_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Deal not found")
    return res.data[0]
