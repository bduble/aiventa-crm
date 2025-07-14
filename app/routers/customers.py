# app/routers/customers.py
print("CUSTOMERS ROUTER LOADED")
from fastapi import APIRouter, HTTPException, status, Query
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import Customer, CustomerCreate, CustomerUpdate

router = APIRouter()

@router.get(
    "/",
    response_model=list[Customer],
    response_model_exclude_none=True,
)
def list_customers(
    q: str | None = Query(None, description="Search term for first or last name"),
    email: str | None = Query(None, description="Filter by email"),
    phone: str | None = Query(None, description="Filter by phone"),
):
    """
    List customers with optional search filters.
    - q: simple ILIKE filter on the combined name column
    - email: ILIKE filter on email
    - phone: ILIKE filter on phone
    """
    try:
        query = supabase.table("customers").select("*")

        if q:
            # Search the combined name column using ILIKE
            query = query.ilike("name", f"%{q}%")

        if email:
            query = query.ilike("email", f"%{email}%")
        if phone:
            query = query.ilike("phone", f"%{phone}%")

        res = query.execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    return res.data or []


@router.get(
    "/{customer_id}",
    response_model=Customer,
    response_model_exclude_none=True,
)
def get_customer(customer_id: int):
    """
    Fetch a single customer by integer ID.
    """
    try:
        res = (
            supabase
            .table("customers")
            .select("*")
            .eq("id", customer_id)
            .maybe_single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return res.data


@router.post(
    "/",
    response_model=Customer,
    status_code=status.HTTP_201_CREATED,
)
def create_customer(c: CustomerCreate):
    """
    Insert a new customer.
    """
    try:
        res = supabase.table("customers").insert(c.dict()).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    return res.data[0]


@router.patch(
    "/{customer_id}",
    response_model=Customer,
)
def update_customer(customer_id: int, c: CustomerUpdate):
    """
    Update existing customer fields.
    """
    payload = {k: v for k, v in c.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        res = (
            supabase
            .table("customers")
            .update(payload)
            .eq("id", customer_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    return res.data[0]


@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_customer(customer_id: int):
    """
    Delete a customer by ID.
    """
    try:
        res = (
            supabase
            .table("customers")
            .delete()
            .eq("id", customer_id)
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    # Returning None yields an empty 204 response
    return
