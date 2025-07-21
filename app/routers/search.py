from fastapi import APIRouter, HTTPException, Query
from postgrest.exceptions import APIError
from app.db import supabase

router = APIRouter()

@router.get("/search")
def global_search(q: str = Query(..., min_length=1), limit: int = 5):
    """Search customers and inventory for the given text."""
    q = q.strip()
    if not q:
        return {"customers": [], "inventory": []}

    try:
        customer_query = (
            supabase
            .table("customers")
            .select("id,name,email,phone")
            .or_(f"name.ilike.%{q}%,email.ilike.%{q}%,phone.ilike.%{q}%")
            .limit(limit)
        )
        customers = customer_query.execute().data or []
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    try:
        inventory_query = (
            supabase
            .table("inventory_with_days_in_stock")
            .select("id,make,model,vin,stocknumber,year")
            .or_(
                f"make.ilike.%{q}%,model.ilike.%{q}%,vin.ilike.%{q}%,stocknumber.ilike.%{q}%"
            )
            .limit(limit)
        )
        inventory = inventory_query.execute().data or []
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    return {"customers": customers, "inventory": inventory}

