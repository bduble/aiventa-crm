import structlog
from loguru import logger as loguru_logger
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Request
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
from app.openai_client import get_openai_client
from pydantic import BaseModel
import uuid
import json
import traceback

# --- Setup structlog globally ---
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger("aiventa.customers")

router = APIRouter()

def get_trace_id(request: Request):
    return request.headers.get("X-Request-ID", str(uuid.uuid4()))

# ---------- Helper for Normalizing Customer Data ----------
def normalize_customer(c):
    if not c.get("name"):
        full_name = f"{c.get('first_name') or ''} {c.get('last_name') or ''}".strip()
        c["name"] = full_name or c.get("customer_name", "") or ""
    if c.get("email", "") == "":
        c["email"] = None
    return c

# ----------- Customer List/Search -----------
@router.get("/", response_model=list[Customer], response_model_exclude_none=True)
def list_customers(
    q: str | None = Query(None, description="Search term for first or last name"),
    email: str | None = Query(None, description="Filter by email"),
    phone: str | None = Query(None, description="Filter by phone"),
    request: Request = None,
):
    trace_id = get_trace_id(request) if request else str(uuid.uuid4())
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
        logger.error({
            "event": "supabase_api_error",
            "endpoint": "/customers",
            "trace_id": trace_id,
            "error_message": str(e)
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error in list_customers: {e}")
        raise HTTPException(status_code=400, detail=e.message)

    customers = [normalize_customer(c) for c in (res.data or [])]
    logger.info({
        "event": "customers_listed",
        "filters": {"q": q, "email": email, "phone": phone},
        "count": len(customers),
        "trace_id": trace_id,
    })
    return customers

@router.get("", include_in_schema=False, response_model=list[Customer], response_model_exclude_none=True)
def list_customers_noslash(
    q: str | None = Query(None, description="Search term for first or last name"),
    email: str | None = Query(None, description="Filter by email"),
    phone: str | None = Query(None, description="Filter by phone"),
    request: Request = None,
):
    return list_customers(q, email, phone, request)

# ----------- Get Single Customer -----------
@router.get(
    "/{customer_id}",
    response_model=Customer,
    response_model_exclude_none=True,
)
def get_customer(customer_id: str, request: Request):
    trace_id = get_trace_id(request)
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
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error in get_customer: {e}")
        raise HTTPException(status_code=400, detail=e.message)

    if not res or not hasattr(res, "data"):
        logger.error({
            "event": "supabase_data_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "response": str(res),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase returned invalid for get_customer: {res}")
        raise HTTPException(status_code=500, detail="Supabase did not return data as expected.")

    if not res.data:
        logger.info({
            "event": "customer_not_found",
            "customer_id": customer_id,
            "trace_id": trace_id,
        })
        raise HTTPException(status_code=404, detail="Customer not found")

    c = normalize_customer(res.data)
    logger.info({
        "event": "customer_fetch_success",
        "customer_id": customer_id,
        "trace_id": trace_id,
    })
    return c

# ----------- Create Customer -----------
@router.post(
    "/",
    response_model=Customer,
    status_code=status.HTTP_201_CREATED,
)
def create_customer(c: CustomerCreate, request: Request):
    trace_id = get_trace_id(request)
    try:
        res = supabase.table("customers").insert(c.dict()).execute()
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": "/customers (POST)",
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error in create_customer: {e}")
        raise HTTPException(status_code=400, detail=e.message)
    created = normalize_customer(res.data[0])
    logger.info({
        "event": "customer_created",
        "customer_id": created.get("id"),
        "trace_id": trace_id,
    })
    return created

# ----------- Patch (Update) Customer -----------
@router.patch(
    "/{customer_id}",
    response_model=Customer,
)
def update_customer(customer_id: str, c: CustomerUpdate, request: Request):
    trace_id = get_trace_id(request)
    payload = {k: v for k, v in c.dict().items() if v is not None}
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    try:
        res = (
            supabase
            .table("customers")
            .update(payload)
            .eq("id", customer_id)
            .select("*")
            .maybe_single()
            .execute()
        )
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id} (PATCH)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error in update_customer: {e}")
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    updated = normalize_customer(res.data)
    logger.info({
        "event": "customer_updated",
        "customer_id": customer_id,
        "trace_id": trace_id,
    })
    return updated

# ----------- Delete Customer -----------
@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_customer(customer_id: str, request: Request):
    trace_id = get_trace_id(request)
    try:
        res = (
            supabase
            .table("customers")
            .delete()
            .eq("id", customer_id)
            .execute()
        )
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id} (DELETE)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error in delete_customer: {e}")
        raise HTTPException(status_code=400, detail=e.message)
    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")
    logger.info({
        "event": "customer_deleted",
        "customer_id": customer_id,
        "trace_id": trace_id,
    })
    return

# ----------- Add Customer to Floor Traffic -----------
@router.post(
    "/{customer_id}/floor-traffic",
    response_model=FloorTrafficCustomer,
    status_code=status.HTTP_201_CREATED,
)
async def add_customer_to_floor_log(customer_id: str, entry: CustomerFloorTrafficCreate, request: Request):
    trace_id = get_trace_id(request)

    # 1. Confirm the customer exists
    try:
        res = (
            supabase.table("customers")
            .select("*")
            .eq("id", customer_id)
            .maybe_single()
            .execute()
        )
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}/floor-traffic (GET)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        raise HTTPException(status_code=400, detail=e.message)
    if not res or not hasattr(res, "data") or not res.data:
        logger.error({
            "event": "floor_traffic_data_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "response": str(res),
            "CRITICAL_ALERT": True,
        })
        raise HTTPException(status_code=404, detail="Customer not found")

    # Be-Back logic
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    be_back = False
    try:
        past = (
            supabase.table("floor_traffic_customers")
            .select("id")
            .eq("customer_id", customer_id)
            .gte("visit_time", thirty_days_ago.isoformat())
            .limit(1)
            .execute()
        )
        be_back = bool(past.data)
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}/floor-traffic (CHECK)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        raise HTTPException(status_code=400, detail=e.message)

    # Allowed columns (only those in floor_traffic_customers!)
    allowed_fields = [
        "customer_id",
        "visit_time",
        "salesperson",
        "vehicle",
        "trade",
        "notes",
        "status",
        "demo",
        "worksheet",
        "customer_offer",
        "sold",
    ]
    payload = {field: getattr(entry, field, None) for field in allowed_fields if hasattr(entry, field) and getattr(entry, field) is not None}
    payload["customer_id"] = customer_id
    if be_back:
        payload["status"] = "Be-Back"
    elif getattr(entry, "status", None):
        payload["status"] = entry.status

    try:
        res = supabase.table("floor_traffic_customers").insert(payload).execute()
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}/floor-traffic (INSERT)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        raise HTTPException(status_code=400, detail=str(e))
    if not res.data:
        logger.error({
            "event": "floor_traffic_insert_fail",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "CRITICAL_ALERT": True,
        })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database insertion failed, no data returned.",
        )
    logger.info({
        "event": "customer_floor_traffic_added",
        "customer_id": customer_id,
        "trace_id": trace_id,
    })
    return res.data[0]

# ----------- Customer Files (Upload/List) -----------
class CustomerFile(BaseModel):
    id: str
    customer_id: str
    name: str
    url: str

@router.get("/{customer_id}/files", response_model=list[CustomerFile])
def list_customer_files(customer_id: str, request: Request):
    trace_id = get_trace_id(request)
    try:
        res = (
            supabase.table("customer_files")
            .select("*")
            .eq("customer_id", customer_id)
            .execute()
        )
        logger.info({
            "event": "customer_files_listed",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "file_count": len(res.data or []),
        })
        return res.data or []
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}/files (GET)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error listing customer files: {e}")
        raise HTTPException(status_code=400, detail=e.message)

@router.post(
    "/{customer_id}/files",
    response_model=CustomerFile,
    status_code=status.HTTP_201_CREATED,
)
def upload_customer_file(customer_id: str, file: UploadFile = File(...), request: Request = None):
    trace_id = get_trace_id(request)
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
        logger.info({
            "event": "customer_file_uploaded",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "filename": file.filename,
        })
        return res.data[0]
    except APIError as e:
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}/files (POST)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error uploading customer file: {e}")
        raise HTTPException(status_code=400, detail=e.message)
