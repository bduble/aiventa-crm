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
