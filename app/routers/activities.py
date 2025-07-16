from fastapi import APIRouter, HTTPException, status, Query
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import Activity, ActivityCreate, ActivityUpdate

router = APIRouter()

@router.get("/today-metrics")
def today_metrics():
    """Return counts of today's activities grouped by type."""
    from datetime import date, datetime, timedelta

    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    try:
        res = (
            supabase.table("activities")
            .select("type")
            .gte("created_at", start.isoformat())
            .lt("created_at", end.isoformat())
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=500, detail=e.message)

    data = res.data or []
    counts = {"sales_calls": 0, "text_messages": 0, "appointments_set": 0}
    for row in data:
        t = str(row.get("type", "")).lower()
        if "call" in t:
            counts["sales_calls"] += 1
        elif "text" in t:
            counts["text_messages"] += 1
        elif "appointment" in t:
            counts["appointments_set"] += 1

    return counts

@router.get("/", response_model=list[Activity])
def list_activities(customer_id: int = Query(None)):
    """List all activities, or filter by customer_id if provided."""
    try:
        q = supabase.table("activities").select("*")
        if customer_id is not None:
            q = q.eq("customer_id", customer_id)
        res = q.execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    return res.data

@router.get("/{act_id}", response_model=Activity)
def get_activity(act_id: int):
    res = (
        supabase.table("activities")
        .select("*")
        .eq("id", act_id)
        .maybe_single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return res.data

@router.post("/", response_model=Activity, status_code=status.HTTP_201_CREATED)
def create_activity(a: ActivityCreate):
    try:
        res = supabase.table("activities").insert(a.dict(exclude_none=True)).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    return res.data[0]

@router.patch("/{act_id}", response_model=Activity)
def update_activity(act_id: int, a: ActivityUpdate):
    payload = {k: v for k, v in a.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = (
            supabase.table("activities")
            .update(payload)
            .eq("id", act_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return res.data[0]

@router.delete("/{act_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(act_id: int):
    try:
        res = supabase.table("activities").delete().eq("id", act_id).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return
