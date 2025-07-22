"""Endpoints for vehicle appraisals."""

from fastapi import APIRouter, HTTPException, Depends
from postgrest.exceptions import APIError

from app.db import supabase
from app.models import Appraisal, AppraisalCreate

router = APIRouter()

# ── Dummy Auth (Replace in production) ──
def get_current_user():
    """Placeholder for authentication."""
    class _User:
        id = 1
        role = "Admin"
    return _User()

def manager_only(user=Depends(get_current_user)):
    if user.role not in {"Manager", "Admin"}:
        raise HTTPException(403, "Managers only")
    return user

# ── List All Appraisals ──
@router.get("/", response_model=list[Appraisal])
def list_appraisals():
    try:
        res = supabase.table("appraisals").select("*").execute()
    except APIError as e:
        raise HTTPException(500, detail=f"Database error: {e.message}")
    return res.data or []

# ── Get Single Appraisal ──
@router.get("/{appraisal_id}", response_model=Appraisal)
def get_appraisal(appraisal_id: str):
    try:
        res = (
            supabase.table("appraisals")
            .select("*")
            .eq("id", appraisal_id)
            .maybe_single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(404, detail=e.message)
    if not res.data:
        raise HTTPException(404, "Not found")
    return res.data

# ── Create New Appraisal ──
@router.post(
    "/",
    response_model=Appraisal,
    status_code=201,
    dependencies=[Depends(manager_only)],
)
def create_appraisal(appraisal: AppraisalCreate, user=Depends(get_current_user)):
    payload = appraisal.model_dump()
    payload["created_by"] = user.id
    try:
        res = supabase.table("appraisals").insert(payload).execute()
    except APIError as e:
        raise HTTPException(400, detail=e.message)
    if not res.data:
        raise HTTPException(500, "Insert failed, no data returned")
    data = res.data[0] if isinstance(res.data, list) else res.data
    return data

# ── Update Existing Appraisal ──
@router.put(
    "/{appraisal_id}",
    response_model=Appraisal,
    dependencies=[Depends(manager_only)],
)
def update_appraisal(appraisal_id: str, appraisal: AppraisalCreate):
    payload = appraisal.model_dump()
    try:
        res = (
            supabase.table("appraisals")
            .update(payload)
            .eq("id", appraisal_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(400, detail=e.message)
    if not res.data:
        raise HTTPException(404, "Not found")
    return res.data[0]

# ── Delete Appraisal ──
@router.delete(
    "/{appraisal_id}",
    status_code=204,
    dependencies=[Depends(manager_only)],
)
def delete_appraisal(appraisal_id: str):
    try:
        supabase.table("appraisals").delete().eq("id", appraisal_id).execute()
    except APIError as e:
        raise HTTPException(404, detail=e.message)
    return None

# ── Upload Images & Run AI (stub) ──
@router.post("/{appraisal_id}/images")
def upload_appraisal_images(appraisal_id: str):
    """Handle uploaded images and run AI to update the damage report (stub)."""
    # TODO: Implement image handling and AI analysis
    return {"success": True}
