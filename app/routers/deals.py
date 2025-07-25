# app/routers/deals.py

from fastapi import APIRouter, HTTPException, status, Depends, Body
from postgrest.exceptions import APIError
from app.db import supabase
from typing import Optional, List
from app.models import Deal, DealCreate, DealUpdate
from datetime import datetime
import logging

router = APIRouter()



# ── Permissions Stub ─────────────────────────────
def get_current_user():
    # TODO: Replace with your real user/session logic
    return {"id": 1, "role": "manager"}  # Use 'manager' or 'sales'

def manager_required(user=Depends(get_current_user)):
    if user.get("role") != "manager":
        raise HTTPException(403, "Manager permissions required")
    return user

# ── Utility ──────────────────────────────────────
def days_to_book(sold_date: Optional[str], booked_date: Optional[str]) -> Optional[int]:
    if sold_date and booked_date:
        try:
            return (datetime.fromisoformat(booked_date) - datetime.fromisoformat(sold_date)).days
        except Exception:
            return None
    return None

def log_audit_action(deal_id: str, action: str, user_id: int, details: str = ""):
    # TODO: Write to an 'audit' table or append to a JSONB field
    logging.info(f"Audit: deal {deal_id} - {action} by {user_id} - {details}")

# ── Endpoints ────────────────────────────────────

@router.get("/", response_model=List[Deal])
@router.get("", response_model=List[Deal], include_in_schema=False)
def list_deals(
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    month: Optional[str] = None  # e.g. "2025-07"
):
    try:
        query = supabase.table("deals").select("*")
        if customer_id:
            query = query.eq("customer_id", customer_id)
        if status:
            query = query.eq("status", status)
        if month:
            # Filter for deals sold this month
            query = query.gte("sold_date", f"{month}-01").lte("sold_date", f"{month}-31")
        res = query.execute()
        return res.data or []
    except APIError as e:
        raise HTTPException(400, detail=e.message)

@router.get("/{deal_id}", response_model=Deal)
def get_deal(deal_id: str):
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

@router.post("/", response_model=Deal, status_code=status.HTTP_201_CREATED, dependencies=[Depends(manager_required)])
@router.post("", response_model=Deal, include_in_schema=False, status_code=status.HTTP_201_CREATED, dependencies=[Depends(manager_required)])
def create_deal(deal: DealCreate, user=Depends(get_current_user)):
    """
    Only managers can create deals. Typically called from the floor log when a customer is marked sold.
    """
    try:
        res = supabase.table("deals").insert(deal.dict()).execute()
        deal_id = res.data[0]["id"]
        log_audit_action(deal_id, "create", user["id"])
        return res.data[0]
    except APIError as e:
        raise HTTPException(400, detail=e.message)

@router.patch("/{deal_id}", response_model=Deal, dependencies=[Depends(manager_required)])
def update_deal(deal_id: str, deal: DealUpdate, user=Depends(get_current_user)):
    payload = {k: v for k, v in deal.dict(exclude_unset=True).items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Optionally, validate workflow/status logic here
    if "status" in payload:
        allowed = ["Pending", "Delivered", "Booked", "Unwound"]
        if payload["status"] not in allowed:
            raise HTTPException(400, f"Invalid status: {payload['status']}")

    try:
        res = (
            supabase
            .table("deals")
            .update(payload)
            .eq("id", deal_id)
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Deal not found")
        log_audit_action(deal_id, "update", user["id"], str(payload))
        return res.data[0]
    except APIError as e:
        raise HTTPException(400, detail=e.message)

@router.post("/{deal_id}/unwind", response_model=Deal, dependencies=[Depends(manager_required)])
def unwind_deal(
    deal_id: str,
    reason: str = Body(..., embed=True),
    user=Depends(get_current_user)
):
    """
    Manager-only: Unwind a deal (remove sold status, add unwind reason and audit log).
    """
    try:
        res = (
            supabase
            .table("deals")
            .update({
                "status": "Unwound",
                "unwind_reason": reason,
                "unwind_date": datetime.utcnow().isoformat()
            })
            .eq("id", deal_id)
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Deal not found")
        log_audit_action(deal_id, "unwind", user["id"], reason)
        return res.data[0]
    except APIError as e:
        raise HTTPException(400, detail=e.message)

