from fastapi import APIRouter, HTTPException, status
from app.db import supabase
from app.models import Activity, ActivityCreate, ActivityUpdate

router = APIRouter()

@router.get("/", response_model=list[Activity])
def list_activities():
    res = supabase.table("activities").select("*").execute()
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
    res = supabase.table("activities").insert(a.dict()).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    return res.data[0]

@router.patch("/{act_id}", response_model=Activity)
def update_activity(act_id: int, a: ActivityUpdate):
    payload = {k: v for k, v in a.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = (
        supabase.table("activities")
        .update(payload)
        .eq("id", act_id)
        .execute()
    )
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return res.data[0]

@router.delete("/{act_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(act_id: int):
    res = supabase.table("activities").delete().eq("id", act_id).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return
