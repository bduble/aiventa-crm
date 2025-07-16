print("CUSTOMERS ROUTER LOADED")
from fastapi import APIRouter, HTTPException, status, Query
from datetime import datetime, timedelta
from postgrest.exceptions import APIError
from app.db import supabase
from app.models import (
    Customer,
    CustomerCreate,
    CustomerUpdate,
    CustomerFloorTrafficCreate,
    FloorTrafficCustomer,
)
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from postgrest.exceptions import APIError
from app.db import supabase
from pydantic import BaseModel
import uuid
from app.models import Customer, CustomerCreate, CustomerUpdate
from app.openai_client import get_openai_client
import json
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
            query = query.ilike("name", f"%{q}%")
        if email:
            query = query.ilike("email", f"%{email}%")
        if phone:
            query = query.ilike("phone", f"%{phone}%")
        res = query.execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    customers = res.data or []
    # --- PATCH: Guarantee 'name' field for each customer ---
    for c in customers:
        if not c.get("name"):
            c["name"] = (
                (c.get("first_name", "") + " " + c.get("last_name", "")).strip()
                or c.get("customer_name", "")
                or ""
            )
        # Patch for email: If it's an empty string, set to None (avoids Pydantic error)
        if c.get("email", "") == "":
            c["email"] = None

    return customers

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

    # --- PATCH: Guarantee 'name' field for single customer ---
    c = res.data
    if not c.get("name"):
        c["name"] = (
            (c.get("first_name", "") + " " + c.get("last_name", "")).strip()
            or c.get("customer_name", "")
            or ""
        )
    # Patch for email: If it's an empty string, set to None
    if c.get("email", "") == "":
        c["email"] = None

    return c

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

    created = res.data[0]
    # Patch for email: If it's an empty string, set to None
    if created.get("email", "") == "":
        created["email"] = None
    return created

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
    updated = res.data[0]
    # Patch for email: If it's an empty string, set to None
    if updated.get("email", "") == "":
        updated["email"] = None
    return updated

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


@router.get("/{customer_id}/ai-summary")
async def customer_ai_summary(customer_id: int):
    """Return an AI generated summary and messaging templates for the customer."""
    try:
        res = (
            supabase.table("customers")
            .select("*")
            .eq("id", customer_id)
            .maybe_single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer = res.data

    client = get_openai_client()
    if not client:
        return {
            "summary": "OpenAI API key not configured",
            "next_steps": [],
            "sms_template": "",
            "email_template": "",
        }

    prompt = (
        "Summarize this customer and suggest the best next step in bullet form. "
        "Also provide a short friendly SMS template and a short professional email "
        "template to contact them. Return JSON with keys 'summary', 'next_steps', "
        "'sms_template', and 'email_template'.\n"
        f"Customer info: {json.dumps(customer)}"
    )

    try:
        chat = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        data = json.loads(chat.choices[0].message.content)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/{customer_id}/floor-traffic",
    response_model=FloorTrafficCustomer,
    status_code=status.HTTP_201_CREATED,
)
async def add_customer_to_floor_log(customer_id: int, entry: CustomerFloorTrafficCreate):
    """Create a floor-traffic entry for an existing customer."""
    # Fetch customer record
    try:
        res = (
            supabase.table("customers")
            .select("*")
            .eq("id", customer_id)
            .maybe_single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer = res.data
    first = customer.get("first_name") or ""
    last = customer.get("last_name") or ""

    # Determine if they've visited in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    try:
        past = (
            supabase.table("floor_traffic_customers")
            .select("id")
            .eq("first_name", first)
            .eq("last_name", last)
            .gte("visit_time", thirty_days_ago.isoformat())
            .limit(1)
            .execute()
        )
        be_back = bool(past.data)
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)

    payload = entry.dict(exclude_unset=True)
    payload.update(
        {
            "first_name": first,
            "last_name": last,
            "email": customer.get("email"),
            "phone": customer.get("phone"),
            "customer_name": (first + " " + last).strip() or customer.get("name"),
            "status": "Be-Back" if be_back else entry.status or None,
        }
    )

    try:
        res = supabase.table("floor_traffic_customers").insert(payload).execute()
    except APIError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion failed, no data returned.",
        )

    return res.data[0]
class CustomerFile(BaseModel):
    id: int
    customer_id: int
    name: str
    url: str


@router.get("/{customer_id}/files", response_model=list[CustomerFile])
def list_customer_files(customer_id: int):
    """Return files uploaded for a customer."""
    try:
        res = (
            supabase.table("customer_files")
            .select("*")
            .eq("customer_id", customer_id)
            .execute()
        )
        return res.data or []
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)


@router.post(
    "/{customer_id}/files",
    response_model=CustomerFile,
    status_code=status.HTTP_201_CREATED,
)
def upload_customer_file(customer_id: int, file: UploadFile = File(...)):
    """Upload a document for the customer."""
    try:
        content = file.file.read()
        filename = f"{uuid.uuid4()}_{file.filename}"
        path = f"{customer_id}/{filename}"
        bucket = supabase.storage.from_("customer-files")
        bucket.upload(path, content, {"content-type": file.content_type})
        url = bucket.get_public_url(path)
        res = (
            supabase.table("customer_files")
            .insert({"customer_id": customer_id, "name": file.filename, "url": url})
            .execute()
        )
        return res.data[0]
    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message)
