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
from fastapi.responses import StreamingResponse
from app.openai_client import get_openai_client
from app.db import supabase
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

