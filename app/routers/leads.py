from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from postgrest.exceptions import APIError
from datetime import datetime, date

from app.db import supabase
from app.openai_client import get_openai_client

import os
import openai
import logging
import json

api_key = os.environ.get("OPENAI_API_KEY")
openai_client = openai.AsyncOpenAI(api_key=api_key) if api_key else None

router = APIRouter()

class LeadCreate(BaseModel):
    name: str
    email: EmailStr

class Lead(BaseModel):
    id: int
    name: str
    email: EmailStr

@router.get("/", response_model=List[Lead])
@router.get("", response_model=List[Lead], include_in_schema=False)
def list_leads():
    """Return all leads."""
    res = supabase.table("leads").select("*").execute()
    return res.data

@router.get("/{lead_id:int}", response_model=Lead)
def get_lead(lead_id: int = Path(..., gt=0)):
    res = supabase.table("leads").select("*").eq("id", lead_id).single().execute()
    if not res.data:
        raise HTTPException(404, f"Lead with id={lead_id} not found")
    return res.data

@router.post("/", response_model=Lead, status_code=201)
@router.post("", response_model=Lead, status_code=201, include_in_schema=False)
def create_lead(lead: LeadCreate):
    payload = lead.dict()
    try:
        res = supabase.table("leads").insert(payload).single().execute()
    except APIError as e:
        raise HTTPException(400, e.message)

    created = res.data

    # Also create a contact record for this lead. Ignore errors so the lead
    # itself is still saved if the contact insert fails (e.g. due to duplicates
    # or RLS restrictions).
    try:
        supabase.table("contacts").insert(
            {
                "name": created.get("name"),
                "email": created.get("email"),
            }
        ).execute()
    except APIError as e:
        logging.warning("Failed to insert contact for lead %s: %s", created.get("id"), e)

    return created

@router.put("/{lead_id:int}", response_model=Lead)
def update_lead(lead_id: int = Path(..., gt=0), lead: LeadCreate = None):
    payload = lead.dict()
    try:
        res = (
            supabase.table("leads")
            .update(payload)
            .eq("id", lead_id)
            .select("*")
            .single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(400, e.message)
    if not res.data:
        raise HTTPException(404, f"Lead with id={lead_id} not found")
    return res.data

@router.delete("/{lead_id:int}", status_code=204)
def delete_lead(lead_id: int = Path(..., gt=0)):
    try:
        res = supabase.table("leads").delete().eq("id", lead_id).execute()
    except APIError as e:
        raise HTTPException(400, e.message)
    if res.count == 0:
        raise HTTPException(404, f"Lead with id={lead_id} not found")
    return


# ── Additional AI/analytics endpoints ─────────────────────────────────────────

def _fetch_all_leads():
    res = supabase.table("leads").select("*").execute()
    return res.data or []


@router.get("/awaiting-response", response_model=List[Lead])
def leads_awaiting_response():
    """Leads who have responded but haven't received a follow-up."""
    leads = _fetch_all_leads()
    pending = [
        l
        for l in leads
        if l.get("last_lead_response_at")
        and (
            not l.get("last_staff_response_at")
            or l.get("last_staff_response_at") < l.get("last_lead_response_at")
        )
    ]
    return pending


@router.get("/prioritized", response_model=List[Lead])
async def prioritized_leads():
    """Return top 10 leads ranked by ChatGPT."""
    leads = _fetch_all_leads()
    if not leads:
        return []

    client = get_openai_client()
    if not client:
        # simple heuristic fallback
        leads.sort(key=lambda l: l.get("last_lead_response_at") or "", reverse=True)
        return leads[:10]

    prompt = (
        "Rank the following leads by likelihood to convert soon. "
        "Return a JSON array of lead ids ordered from highest to lowest priority.\n"
        f"Leads: {json.dumps(leads)}"
    )
    try:
        chat = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        content = chat.choices[0].message.content
        ids = json.loads(content)
    except Exception:
        leads.sort(key=lambda l: l.get("last_lead_response_at") or "", reverse=True)
        return leads[:10]

    ordered = [next((l for l in leads if l["id"] == i), None) for i in ids]
    ordered = [l for l in ordered if l]
    return ordered[:10]


class AskPayload(BaseModel):
    question: str
    lead_id: Optional[int] = None


@router.post("/ask")
async def ask_lead_question(payload: AskPayload):
    """Allow users to ask questions or generate messages about a lead."""
    leads = _fetch_all_leads()
    lead = next((l for l in leads if l["id"] == payload.lead_id), None)
    context = f"Lead info: {json.dumps(lead)}" if lead else ""
    prompt = f"{payload.question}\n{context}"
    client = get_openai_client()
    if not client:
        return {"answer": "OpenAI API key not configured"}
    try:
        chat = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return {"answer": chat.choices[0].message.content}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/metrics")
def lead_metrics():
    """Return simple sales KPIs."""
    leads = _fetch_all_leads()
    total = len(leads)

    engaged = [l for l in leads if l.get("last_lead_response_at")]
    engagement_rate = round(len(engaged) / total * 100, 2) if total else 0.0

    response_deltas = []
    for l in engaged:
        if l.get("last_staff_response_at"):
            try:
                la = datetime.fromisoformat(l["last_lead_response_at"])
                sa = datetime.fromisoformat(l["last_staff_response_at"])
                response_deltas.append((sa - la).total_seconds())
            except Exception:
                pass

    avg_response_time = sum(response_deltas) / len(response_deltas) if response_deltas else 0.0

    conversion_rate = round(len(engaged) / total * 100, 2) if total else 0.0

    return {
        "total_leads": total,
        "conversion_rate": conversion_rate,
        "average_response_time": avg_response_time,
        "lead_engagement_rate": engagement_rate,
    }


@router.get("/month-metrics")
def month_metrics():
    """Return month-to-date lead metrics."""
    today = date.today()
    start = datetime.combine(today.replace(day=1), datetime.min.time())
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)

    try:
        res = (
            supabase.table("leads")
            .select("*")
            .gte("created_at", start.isoformat())
            .lt("created_at", end.isoformat())
            .execute()
        )
    except APIError as e:
        logging.error("Supabase query failed: %s", e.message)
        return {
            "total_leads": 0,
            "conversion_rate": 0,
            "average_response_time": 0,
            "lead_engagement_rate": 0,
        }

    rows = res.data or []
    total = len(rows)
    engaged = [r for r in rows if r.get("last_lead_response_at")]
    engagement_rate = round(len(engaged) / total * 100, 2) if total else 0.0

    response_deltas = []
    for r in engaged:
        if r.get("last_staff_response_at"):
            try:
                la = datetime.fromisoformat(r["last_lead_response_at"])
                sa = datetime.fromisoformat(r["last_staff_response_at"])
                response_deltas.append((sa - la).total_seconds())
            except Exception:
                pass

    avg_response_time = sum(response_deltas) / len(response_deltas) if response_deltas else 0.0

    conversion_rate = engagement_rate

    return {
        "total_leads": total,
        "conversion_rate": conversion_rate,
        "average_response_time": avg_response_time,
        "lead_engagement_rate": engagement_rate,
    }
