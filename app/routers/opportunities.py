from fastapi import APIRouter, HTTPException
from app.db import supabase
from app.models import Opportunity, OpportunityCreate

router = APIRouter()

@router.get("/", response_model=list[Opportunity])
def list_opportunities():
    res = supabase.table("opportunities").select("*").execute()
    return res.data

@router.post("/", response_model=Opportunity, status_code=201)
def create_opportunity(o: OpportunityCreate):
    res = supabase.table("opportunities").insert(o.dict()).single().execute()
    if hasattr(res, "error") and res.error:
        raise HTTPException(400, res.error.message)
    return res.data

from fastapi import APIRouter, HTTPException, status
from app.db import supabase
from app.models import Opportunity, OpportunityCreate, OpportunityUpdate

router = APIRouter()

@router.get("/", response_model=list[Opportunity])
def list_opportunities():
    res = supabase.table("opportunities").select("*").execute()
    return res.data

@router.get("/{opp_id}", response_model=Opportunity)
def get_opportunity(opp_id: int):
    res = supabase.table("opportunities") \
        .select("*") \
        .eq("id", opp_id) \
        .maybe_single() \
        .execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return res.data

@router.post("/", response_model=Opportunity, status_code=status.HTTP_201_CREATED)
def create_opportunity(o: OpportunityCreate):
    res = supabase.table("opportunities").insert(o.dict()).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    return res.data[0]

@router.patch("/{opp_id}", response_model=Opportunity)
def update_opportunity(opp_id: int, o: OpportunityUpdate):
    payload = {k: v for k, v in o.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase.table("opportunities") \
        .update(payload) \
        .eq("id", opp_id) \
        .execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return res.data[0]

@router.delete("/{opp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity(opp_id: int):
    res = supabase.table("opportunities") \
        .delete() \
        .eq("id", opp_id) \
        .execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return
