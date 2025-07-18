# app/openai_router.py

"""Routes for the aiVenta assistant.

This module exposes two endpoints:

* ``POST /ai/ask``       - Ask a question and get a single response.
* ``GET  /ai/ask-stream`` - Ask a question and receive a streamed reply via
  Server Sent Events (SSE).

Both endpoints share the same tool calling logic. ``ask`` returns the full
response once complete while ``ask_stream`` yields tokens as they arrive.
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from app.openai_client import get_openai_client
from app.db import supabase
from app.comp_check import aggregate_comps
from datetime import datetime, timezone
import asyncio
import json
import os


router = APIRouter(prefix="/ai")

# The Supabase client comes from ``app.db`` which falls back to an in-memory
# stub when credentials are not configured.  OpenAI is retrieved lazily in each
# handler via ``get_openai_client`` so tests can patch the helper easily.


# ---------------------------------------------------------------------------
# Tool declarations
# ---------------------------------------------------------------------------

functions = [
    {
        "name": "get_inventory",
        "description": "Fetch vehicles from inventory",
        "parameters": {
            "type": "object",
            "properties": {
                "model": {"type": "string"},
                "max_price": {"type": "number"},
                "limit": {"type": "integer", "default": 5},
            },
            "required": ["model"],
        },
    },
    {
        "name": "get_best_contacts",
        "description": "Return contacts sorted by likelihood to buy soon",
        "parameters": {
            "type": "object",
            "properties": {
                "segment": {
                    "type": "string",
                    "description": "e.g. 'service_due', 'hot_leads'",
                },
                "limit": {"type": "integer", "default": 10},
            },
            "required": ["segment"],
        },
    },
]


# ---------------------------------------------------------------------------
# Tool runners
# ---------------------------------------------------------------------------

def get_inventory(args: dict) -> list:
    """Fetch inventory rows matching the provided filters."""
    q = (
        supabase.from_("ai_inventory_context")
        .select("stock,vin,year,make,model,trim,internet_price,miles")
        .ilike("model", f"%{args['model']}%")
        .lte("internet_price", args.get("max_price", 999999))
        .limit(args.get("limit", 5))
        .execute()
    )
    return q.data


def get_best_contacts(args: dict) -> list:
    """Return contacts ranked by purchase likelihood."""
    rows = (
        supabase.rpc(
            "rank_contacts",
            {"segment": args["segment"], "limit_num": args.get("limit", 10)},
        ).execute()
    )
    return rows.data


TOOLS = {
    "get_inventory": get_inventory,
    "get_best_contacts": get_best_contacts,
}


# Simple keyword check for inventory queries
def _is_inventory_question(text: str) -> bool:
    tokens = text.lower()
    keywords = ["inventory", "vehicle", "vehicles", "car", "cars", "stock"]
    return any(k in tokens for k in keywords)


# ---------------------------------------------------------------------------
# /ai/ask endpoint
# ---------------------------------------------------------------------------

@router.post("/ask")
async def ask(request: Request):
    """Return a single answer to the provided question."""

    body = await request.json()
    question = body.get("question", "").strip()
    if not question:
        raise HTTPException(400, "Question missing")

    # Obtain the OpenAI client lazily so tests can patch ``get_openai_client``.
    openai = get_openai_client()
    if not openai:
        return {"answer": "OpenAI API key not configured"}

    # If it's obviously an inventory question, inject context directly
    if _is_inventory_question(question):
        res = (
            supabase.table("ai_inventory_context")
            .select("*")
            .limit(5)
            .execute()
        )
        rows = res.data or []
        context_block = json.dumps(rows)
        prompt = (
            "You are the aiVenta CRM Assistant. Here is the current inventory data:\n"
            f"{context_block}\n"
            "Answer the user's question using this inventory data.\n"
            f"User: {question}\nAI:"
        )
        second = await openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            max_tokens=350,
        )
        return {"answer": second.choices[0].message.content.strip()}

    # Otherwise, let GPT decide whether a tool is required
    first = await openai.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        functions=functions,
        messages=[
            {
                "role": "system",
                "content": "You are aiVenta, the dealership’s expert assistant.",
            },
            {"role": "user", "content": question},
        ],
    )

    msg = first.choices[0].message
    if msg.function_call:
        fn_name = msg.function_call.name
        args = json.loads(msg.function_call.arguments)
        data = TOOLS[fn_name](args)

        # Second pass – answer using the fetched data
        second = await openai.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.4,
            messages=[
                {"role": "system", "content": "Answer using only the provided data."},
                {"role": "user", "content": question},
                msg,
                {
                    "role": "tool",
                    "name": fn_name,
                    "content": json.dumps(data),
                },
            ],
        )
        answer = second.choices[0].message.content.strip()
        return {"answer": answer}

    # Fallback: GPT didn’t require tool data
    return {"answer": msg.content.strip()}


# ---------------------------------------------------------------------------
# /ai/ask-stream endpoint
# ---------------------------------------------------------------------------

@router.get("/ask-stream")
async def ask_stream(q: str):
    """Stream the answer to ``q`` using Server Sent Events."""

    question = q.strip()
    if not question:
        raise HTTPException(400, "Question missing")

    openai = get_openai_client()
    if not openai:
        async def event_stream():
            yield "data: OpenAI API key not configured\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(event_stream(), headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        })

    async def event_stream():
        # First pass – let GPT decide if a tool is needed
        first = await openai.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            functions=functions,
            messages=[
                {
                    "role": "system",
                    "content": "You are aiVenta, the dealership’s expert assistant.",
                },
                {"role": "user", "content": question},
            ],
            stream=False,
        )
        msg = first.choices[0].message

        # If a function is called, fetch data and do a second streamed pass
        if msg.function_call:
            fn_name = msg.function_call.name
            args = json.loads(msg.function_call.arguments)
            data = TOOLS[fn_name](args)

            second = await openai.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0.4,
                messages=[
                    {
                        "role": "system",
                        "content": "Answer using only the provided data.",
                    },
                    {"role": "user", "content": question},
                    msg,
                    {
                        "role": "tool",
                        "name": fn_name,
                        "content": json.dumps(data),
                    },
                ],
                stream=True,  # Stream this call
            )
        else:
            # No tool required; stream the first reply
            second = await openai.chat.completions.create(
                model="gpt-4o-mini",
                temperature=0.4,
                messages=[
                    {
                        "role": "system",
                        "content": "You are aiVenta, the dealership’s expert assistant.",
                    },
                    {"role": "user", "content": question},
                ],
                stream=True,
            )

        # Forward token chunks to the client as SSE messages
        async for chunk in second:
            tok = getattr(chunk.choices[0].delta, "content", None)
            if tok:
                yield f"data: {tok}\n\n"
            await asyncio.sleep(0)
        yield "data: [DONE]\n\n"

    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    }
    return StreamingResponse(event_stream(), headers=headers)


# ---------------------------------------------------------------------------
# AI context aggregation
# ---------------------------------------------------------------------------

def get_inventory_with_comps() -> list:
    """Return inventory rows with recent market comps attached."""
    inv_res = supabase.table("ai_inventory_context").select("*").execute()
    inventory = inv_res.data or []

    for car in inventory:
        car_id = car.get("id")
        comps_res = (
            supabase.table("market_comps")
            .select("source,year,make,model,trim,mileage,price,url,created_at")
            .eq("inventory_id", car_id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
        car["comps"] = comps_res.data or []

    return inventory


def get_overdue_followups() -> dict:
    """Return overdue tasks and activities."""
    now = datetime.now(timezone.utc)

    tasks_res = (
        supabase.table("tasks")
        .select(
            "id, customer_id, description, due_date, completed, assigned_to"
        )
        .eq("completed", False)
        .lt("due_date", now.isoformat())
        .order("due_date")
        .limit(20)
        .execute()
    )
    overdue_tasks = tasks_res.data or []

    act_res = (
        supabase.table("activities")
        .select("id, subject, scheduled_at, performed_at, customer_id")
        .is_("performed_at", None)
        .lt("scheduled_at", now.isoformat())
        .order("scheduled_at")
        .limit(20)
        .execute()
    )
    overdue_acts = act_res.data or []

    return {"tasks": overdue_tasks, "activities": overdue_acts}


def get_hot_leads() -> list:
    """Return the most recent leads."""
    leads_res = (
        supabase.table("leads")
        .select("id, name, email, phone, source, created_at")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return leads_res.data or []


@router.get("/context/full")
def get_full_ai_context():
    """Aggregate inventory, follow-ups and lead info for AI prompts."""
    inventory = get_inventory_with_comps()
    overdue = get_overdue_followups()
    hot_leads = get_hot_leads()

    inv_lines = []
    for car in inventory:
        line = (
            f"- {car.get('year')} {car.get('make')} {car.get('model')} {car.get('trim')} "
            f"| {car.get('mileage')} mi | ${car.get('price')} | Stock#: {car.get('stocknumber')}"
        )
        if car.get("comps"):
            comps_lines = [
                (
                    f"    • [{c['source']}] {c['year']} {c['make']} {c['model']} {c['trim']} "
                    f"| {c['mileage']} mi | ${c['price']} ({c['url']})"
                )
                for c in car["comps"]
            ]
            line += "\n" + "\n".join(comps_lines)
        inv_lines.append(line)

    overdue_lines = []
    for task in overdue["tasks"]:
        overdue_lines.append(
            f"- Task for Customer ID {task['customer_id']}: {task['description']} (Due {task['due_date']}) [Assigned: {task['assigned_to']}]"
        )
    for act in overdue["activities"]:
        overdue_lines.append(
            f"- Activity '{act['subject']}' for Customer ID {act['customer_id']} (Was scheduled {act['scheduled_at']})"
        )

    hot_lines = []
    for lead in hot_leads:
        hot_lines.append(
            f"- {lead['name']} ({lead['email']}, {lead['phone']}) from {lead['source']} [Received {lead['created_at']}]"
        )

    return JSONResponse(
        content={
            "inventory": inventory,
            "overdue": overdue,
            "hot_leads": hot_leads,
            "ai_context_blocks": {
                "inventory_block": "\n".join(inv_lines),
                "overdue_block": "\n".join(overdue_lines),
                "hot_leads_block": "\n".join(hot_lines),
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


@router.get("/inventory/{item_id}/review")
async def inventory_ai_review(item_id: int, zipcode: str = "76504", radius: int = 200):
    """Return an AI generated market review for a specific inventory item."""
    res = (
        supabase.table("inventory")
        .select("id,year,make,model,trim,sellingprice,mileage")
        .eq("id", item_id)
        .maybe_single()
        .execute()
    )
    vehicle = res.data
    if not vehicle:
        raise HTTPException(status_code=404, detail="Item not found")

    comps = aggregate_comps(vehicle["year"], vehicle["make"], vehicle["model"], vehicle.get("trim"), zipcode, radius)
    num_available = len(comps.get("comps", []))

    openai = get_openai_client()
    if not openai:
        analysis = "OpenAI API key not configured"
    else:
        prompt = (
            "You are an expert automotive pricing assistant. "
            f"Consider this vehicle: {vehicle}. "
            f"{num_available} comparable vehicles were found within {radius} miles. "
            f"Market average price is ${comps['market_avg']:,}. "
            f"Typical range is ${comps['market_low']:,}-${comps['market_high']:,}. "
            "Provide a brief pricing recommendation." 
        )
        resp = await openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}],
            max_tokens=150,
        )
        analysis = resp.choices[0].message.content.strip()

    return {
        "vehicle": vehicle,
        "num_available": num_available,
        "market_avg": comps.get("market_avg"),
        "market_low": comps.get("market_low"),
        "market_high": comps.get("market_high"),
        "analysis": analysis,
    }

