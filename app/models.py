from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

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
    phone: Optional[str]

class ContactUpdate(BaseModel):
    lead_id: Optional[int]
    account_id: Optional[int]
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]


# ── Accounts ───────────────────────────────────────────────────────────────────

class Account(BaseModel):
    id: int
    name: str
    industry: Optional[str]

class AccountCreate(BaseModel):
    name: str
    industry: Optional[str]

class AccountUpdate(BaseModel):
    name: Optional[str]
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

class OpportunityUpdate(BaseModel):
    name: Optional[str]
    account_id: Optional[int]
    contact_id: Optional[int]
    stage: Optional[str]
    amount: Optional[float]
    close_date: Optional[date]    


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

class ActivityUpdate(BaseModel):
    opportunity_id: Optional[int]
    contact_id: Optional[int]
    type: Optional[str]
    subject: Optional[str]
    notes: Optional[str]
    date: Optional[date]

# ── Floor Log ─────────────────────────────────────────────────────────────────

class FloorTrafficCustomer(BaseModel):
    id: int
    salesperson: str
    customer_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_time: datetime
    notes: Optional[str]
    created_at: datetime

class FloorTrafficCustomerCreate(BaseModel):
    salesperson: str
    customer_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_time: Optional[datetime] = None
    notes: Optional[str] = None

class FloorTrafficCustomerUpdate(BaseModel):
    salesperson: Optional[str] = None
    customer_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_time: Optional[datetime] = None
    notes: Optional[str] = None


# … your existing Contact, Opportunity, etc. …

