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

    customers = res.data or []
    for c in customers:
        if not c.get("name"):
            c["name"] = (
                (c.get("first_name", "") + " " + c.get("last_name", "")).strip()
                or c.get("customer_name", "")
                or ""
            )
        if c.get("email", "") == "":
            c["email"] = None
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
    c = res.data
    if not c.get("name"):
        c["name"] = (
            (c.get("first_name", "") + " " + c.get("last_name", "")).strip()
            or c.get("customer_name", "")
            or ""
        )
    if c.get("email", "") == "":
        c["email"] = None
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
    created = res.data[0]
    if created.get("email", "") == "":
        created["email"] = None
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
    updated = res.data
    if updated.get("email", "") == "":
        updated["email"] = None
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

# ----------- AI Customer Summary -----------
@router.get("/{customer_id}/ai-summary")
async def customer_ai_summary(customer_id: str, request: Request):
    trace_id = get_trace_id(request)
    try:
        res = (
            supabase.table("customers")
            .select("*")
            .eq("id", customer_id)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        logger.error({
            "event": "ai_summary_db_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase DB error in ai-summary: {e}")
        raise HTTPException(status_code=500, detail=f"Supabase DB error: {e}")

    if not res or not hasattr(res, "data"):
        logger.error({
            "event": "ai_summary_data_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "response": str(res),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase returned invalid for ai-summary: {res}")
        raise HTTPException(status_code=500, detail="Supabase did not return data as expected.")

    if not res.data:
        logger.warning({
            "event": "ai_summary_customer_not_found",
            "customer_id": customer_id,
            "trace_id": trace_id,
        })
        raise HTTPException(status_code=404, detail="Customer not found")
    customer = res.data

    client = get_openai_client()
    if not client:
        logger.error({
            "event": "ai_summary_no_openai",
            "trace_id": trace_id,
            "CRITICAL_ALERT": True,
        })
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
        logger.info({
            "event": "ai_summary_generated",
            "customer_id": customer_id,
            "trace_id": trace_id,
        })
        return data
    except Exception as e:
        logger.error({
            "event": "ai_summary_ai_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] AI error in ai-summary: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"AI error: {e}")

# ----------- AI Next Action -----------
@router.get("/{customer_id}/ai-next-action", summary="AI-Recommended Next Action")
async def ai_next_action(customer_id: str, request: Request):
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
    except Exception as e:
        logger.error({
            "event": "ai_next_action_db_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase DB error in ai-next-action: {e}")
        raise HTTPException(status_code=500, detail=f"Supabase DB error: {e}")

    if not res or not hasattr(res, "data"):
        logger.error({
            "event": "ai_next_action_data_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "response": str(res),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase returned invalid for ai-next-action: {res}")
        raise HTTPException(status_code=500, detail="Supabase did not return data as expected.")

    customer = res.data
    if not customer:
        logger.warning({
            "event": "ai_next_action_customer_not_found",
            "customer_id": customer_id,
            "trace_id": trace_id,
        })
        raise HTTPException(status_code=404, detail="Customer not found")

    client = get_openai_client()
    if not client:
        logger.error({
            "event": "ai_next_action_no_openai",
            "trace_id": trace_id,
            "CRITICAL_ALERT": True,
        })
        return {"next_action": "AI not available. Please try again later."}

    prompt = (
        f"Given the following car dealership customer record, recommend the single best next action for a salesperson "
        f"to move the customer forward in the buying process. "
        f"Return only a short, specific action, not a summary.\n\n"
        f"Customer Data: {json.dumps(customer)}"
    )

    try:
        chat = await client.chat.completions.create(
            model="gpt-4o",  # Use your preferred model
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        next_action = chat.choices[0].message.content.strip()
        logger.info({
            "event": "ai_next_action_generated",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "next_action": next_action
        })
        return {"next_action": next_action}
    except Exception as e:
        logger.error({
            "event": "ai_next_action_ai_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "traceback": traceback.format_exc(),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] AI error in ai-next-action: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"AI error: {e}")

# ----------- Add Customer to Floor Traffic -----------
@router.post(
    "/{customer_id}/floor-traffic",
    response_model=FloorTrafficCustomer,
    status_code=status.HTTP_201_CREATED,
)
async def add_customer_to_floor_log(customer_id: str, entry: CustomerFloorTrafficCreate, request: Request):
    trace_id = get_trace_id(request)
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
        loguru_logger.error(f"[{trace_id}] Supabase API error in add_customer_to_floor_log: {e}")
        raise HTTPException(status_code=400, detail=e.message)
    if not res or not hasattr(res, "data"):
        logger.error({
            "event": "floor_traffic_data_error",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "response": str(res),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase returned invalid for floor-traffic: {res}")
        raise HTTPException(status_code=500, detail="Supabase did not return data as expected.")
    if not res.data:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer = res.data
    first = customer.get("first_name") or ""
    last = customer.get("last_name") or ""
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
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}/floor-traffic (CHECK)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error checking past floor traffic: {e}")
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
        logger.error({
            "event": "supabase_api_error",
            "endpoint": f"/customers/{customer_id}/floor-traffic (INSERT)",
            "customer_id": customer_id,
            "trace_id": trace_id,
            "error_message": str(e),
            "CRITICAL_ALERT": True,
        })
        loguru_logger.error(f"[{trace_id}] Supabase API error inserting floor traffic: {e}")
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
