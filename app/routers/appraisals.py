"""Endpoints for vehicle appraisals."""

from fastapi import APIRouter, HTTPException, Depends
from postgrest.exceptions import APIError

from app.db import supabase
from app.models import Appraisal, AppraisalCreate


router = APIRouter()


def get_current_user():
    """Placeholder auth dependency.

    This project does not implement authentication in tests, so this function
    simply returns a minimal object with an ``id`` and ``role`` attribute. In a
    real application, replace this with actual authentication logic.
    """

    class _User:
        id = 1
        role = "Admin"

    return _User()


def manager_only(user=Depends(get_current_user)):
    if user.role not in {"Manager", "Admin"}:
        raise HTTPException(403, "Managers only")
    return user


@router.get("/", response_model=list[Appraisal])
def list_appraisals():
    res = supabase.table("appraisals").select("*").execute()
    return res.data or []


@router.get("/{appraisal_id}", response_model=Appraisal)
def get_appraisal(appraisal_id: str):
    try:
        res = (
            supabase.table("appraisals")
            .select("*")
            .eq("id", appraisal_id)
            .single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(404, detail=e.message)

    if not res.data:
        raise HTTPException(404, "Not found")
    return res.data


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

    data = res.data[0] if isinstance(res.data, list) else res.data
    return data


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


@router.post("/{appraisal_id}/images")
def upload_appraisal_images(appraisal_id: str):
    """Handle uploaded images and run AI to update the damage report (stub)."""
    return {"success": True}

