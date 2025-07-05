from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator

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
    stage: str   # e.g. "Prospecting", "Negotiation", "Closed Won", etc.
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
    contact_id: Optional[int]
    opportunity_id: Optional[int]
    type: Optional[str]
    subject: Optional[str]
    note: Optional[str]
    date: Optional[date]


# ── Floor Log ─────────────────────────────────────────────────────────────────

class FloorTrafficCustomer(BaseModel):
    id: str
    salesperson: str
    customer_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_time: datetime
    notes: Optional[str] = None
    created_at: datetime

class FloorTrafficCustomerCreate(BaseModel):(BaseModel):
    visit_time: datetime
    salesperson: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

    @validator('email', pre=True, always=True)
    def empty_string_to_none(cls, v):
        # Convert empty strings to None so EmailStr validation is skipped
        if v in (None, ''):
            return None
        return v

class FloorTrafficCustomerUpdate(BaseModel):
    salesperson: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_time: Optional[datetime] = None
    notes: Optional[str] = None


# ── Inventory ─────────────────────────────────────────────────────────────────

class CamelModel(BaseModel):
    """Base model that converts snake_case fields to camelCase aliases."""

    class Config:
        allow_population_by_field_name = True

        @staticmethod
        def alias_generator(string: str) -> str:
            parts = string.split('_')
            return parts[0] + ''.join(word.capitalize() for word in parts[1:])

class InventoryItem(CamelModel):
    id: int
    stock_number: Optional[str] = None
    vin: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    price: Optional[float] = None
    mileage: Optional[int] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    fuel_type: Optional[str] = None
    drivetrain: Optional[str] = None
    active: Optional[bool] = True
    video_urls: Optional[list[str]] = None
    history_report: Optional[str] = None

class InventoryItemCreate(CamelModel):
    stock_number: Optional[str] = None
    vin: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    price: Optional[float] = None
    mileage: Optional[int] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    fuel_type: Optional[str] = None
    drivetrain: Optional[str] = None
    active: Optional[bool] = True
    video_urls: Optional[list[str]] = None
    history_report: Optional[str] = None

class InventoryItemUpdate(CamelModel):
    stock_number: Optional[str] = None
    vin: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    price: Optional[float] = None
    mileage: Optional[int] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    fuel_type: Optional[str] = None
    drivetrain: Optional[str] = None
    active: Optional[bool] = None
    video_urls: Optional[list[str]] = None
    history_report: Optional[str] = None
