from typing import Optional
from pydantic import BaseModel

# ── Leads ──────────────────────────────────────────────────────────────────────

class Lead(BaseModel):
    id: int
    name: str
    email: Optional[str]

class LeadCreate(BaseModel):
    name: str
    email: Optional[str]


# ── Contacts ───────────────────────────────────────────────────────────────────

class Contact(BaseModel):
    id: int
    lead_id: Optional[int]
    account_id: Optional[int]
    name: str
    email: Optional[str]
    phone: Optional[str]

class ContactCreate(BaseModel):
    lead_id: Optional[int]
    account_id: Optional[int]
    name: str
    email: Optional[str]
    phone: Optional[str>


# ── Accounts ───────────────────────────────────────────────────────────────────

class Account(BaseModel):
    id: int
    name: str
    industry: Optional[str]

class AccountCreate(BaseModel):
    name: str
    industry: Optional[str]


# ── Opportunities ──────────────────────────────────────────────────────────────

class Opportunity(BaseModel):
    id: int
    account_id: int
    name: str
    stage: str  # e.g. "Prospecting", "Negotiation", "Closed Won", etc.
    amount: Optional[float]

class OpportunityCreate(BaseModel):
    account_id: int
    name: str
    stage: str
    amount: Optional[float]


# ── Activities ─────────────────────────────────────────────────────────────────

class Activity(BaseModel):
    id: int
    type: str        # e.g. "call", "email", "task"
    subject: str
    note: Optional[str]
    related_lead_id: Optional[int]
    related_contact_id: Optional[int]
    related_account_id: Optional[int]
    related_opportunity_id: Optional[int]

class ActivityCreate(BaseModel):
    type: str
    subject: str
    note: Optional[str]
    related_lead_id: Optional[int]
    related_contact_id: Optional[int]
    related_account_id: Optional[int]
    related_opportunity_id: Optional[int]
