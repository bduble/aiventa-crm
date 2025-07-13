# app/models.py

from datetime import date, datetime, time
from typing import Optional, List
from pydantic import BaseModel, EmailStr, root_validator, validator, ConfigDict

# ── Analytics Schema ─────────────────────────────────────────────────────────
class MonthMetrics(BaseModel):
    total_customers: int
    demo_count: int
    worksheet_count: int
    customer_offer_count: int
    sold_count: int


# ── Leads ──────────────────────────────────────────────────────────────────────
class Lead(BaseModel):
    id: str
    name: str
    email: Optional[str]

class LeadCreate(BaseModel):
    name: str
    email: Optional[str]


# ── Contacts ───────────────────────────────────────────────────────────────────
class Contact(BaseModel):
    id: str
    lead_id: Optional[int]
    account_id: Optional[int]
    name: str
    email: Optional[str]
    phone: Optional[str]

class ContactCreate(BaseModel):
    lead_id: Optional[str]
    account_id: Optional[str]
    name: str
    email: Optional[str]
    phone: Optional[str]

class ContactUpdate(BaseModel):
    lead_id: Optional[str]
    account_id: Optional[str]
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]


# ── Customers ─────────────────────────────────────────────────────────────────
class Customer(BaseModel):
    id: str                           # string PK
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: str
    vehicle: Optional[str] = None
    trade: Optional[str] = None
    demo: Optional[bool] = None
    worksheet: Optional[bool] = None
    customer_offer: Optional[bool] = None
    sold: Optional[bool] = None
    created_at: Optional[datetime] = None

class CustomerCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


# ── Accounts ───────────────────────────────────────────────────────────────────
class Account(BaseModel):
    id: str
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
    id: str
    account_id: str
    name: str
    stage: str   # e.g. "Prospecting", "Negotiation", "Closed Won", etc.
    amount: Optional[float]

class OpportunityCreate(BaseModel):
    account_id: str
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
    id: str
    activity_type: str        # e.g. "call", "email", "task"
    subject: str
    note: Optional[str]
    related_lead_id: Optional[int]
    related_contact_id: Optional[int]
    related_account_id: Optional[int]
    related_opportunity_id: Optional[int]

class ActivityCreate(BaseModel):
    activity_type: str
    subject: str
    note: Optional[str]
    related_lead_id: Optional[int]
    related_contact_id: Optional[int]
    related_account_id: Optional[int]
    related_opportunity_id: Optional[int]

class ActivityUpdate(BaseModel):
    contact_id: Optional[str]
    opportunity_id: Optional[str]
    activity_type: Optional[str]
    subject: Optional[str]
    note: Optional[str]
    date: Optional[date]


# ── Floor Traffic Log ─────────────────────────────────────────────────────────
class FloorTrafficCustomer(BaseModel):
    id: str
    salesperson: str
    customer_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_time: datetime
    time_out: Optional[datetime] = None
    demo: Optional[bool] = None
    worksheet: Optional[bool] = None
    customer_offer: Optional[bool] = None
    notes: Optional[str] = None
    created_at: datetime

class FloorTrafficCustomerCreate(BaseModel):
    visit_time: datetime
    salesperson: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    demo: Optional[bool] = None
    worksheet: Optional[bool] = None
    customer_offer: Optional[bool] = None
    notes: Optional[str] = None
    time_out: Optional[datetime] = None

    @validator('email', pre=True, always=True)
    def empty_string_to_none(cls, v):
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
    time_out: Optional[datetime] = None
    demo: Optional[bool] = None
    worksheet: Optional[bool] = None
    customer_offer: Optional[bool] = None
    notes: Optional[str] = None


# ── Inventory ─────────────────────────────────────────────────────────────────
def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

class CamelModel(BaseModel):
    """Base model that converts snake_case fields to camelCase aliases."""
    model_config = ConfigDict(validate_by_name=True, alias_generator=to_camel)

class InventoryItem(CamelModel):
    id: int
    stocknumber: Optional[str] = None          # 'stocknumber'
    vin: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    sellingprice: Optional[float] = None       # 'sellingprice'
    msrp: Optional[float] = None
    mileage: Optional[int] = None
    exterior_color: Optional[str] = None       # 'exterior_color'
    interior_color: Optional[str] = None       # 'interior_color'
    certified: Optional[bool] = None           # 'certified'
    type: Optional[str] = None                 # 'type'
    drive_type: Optional[str] = None           # 'drive_type'
    transmission: Optional[str] = None
    engine: Optional[str] = None
    cylinders: Optional[int] = None
    displacement: Optional[float] = None
    descriptions: Optional[str] = None
    date_added: Optional[datetime] = None
    link: Optional[str] = None
    image_link: Optional[str] = None
    additional_image_link: Optional[str] = None
    # Add any other additional_image_link_N if you want
    dealership_name: Optional[str] = None
    dealership_address: Optional[str] = None
    primary_key: Optional[str] = None
    primary_key_raw: Optional[str] = None
    video_player_url: Optional[str] = None     # 'VideoPlayerURL'
    status_code: Optional[str] = None
    days_in_stock: Optional[int] = None
    # For photos array/json
    image_url: Optional[List[str]] = None      # if you want the JSON array
    # Add any other fields as needed

class InventoryItemCreate(CamelModel):
    # Same fields as InventoryItem, but all Optional except what you require for creation
    stocknumber: Optional[str] = None
    vin: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    sellingprice: Optional[float] = None
    msrp: Optional[float] = None
    mileage: Optional[int] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    certified: Optional[bool] = None
    type: Optional[str] = None
    drive_type: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    cylinders: Optional[int] = None
    displacement: Optional[float] = None
    descriptions: Optional[str] = None
    date_added: Optional[datetime] = None
    link: Optional[str] = None
    image_link: Optional[str] = None
    additional_image_link: Optional[str] = None
    dealership_name: Optional[str] = None
    dealership_address: Optional[str] = None
    primary_key: Optional[str] = None
    primary_key_raw: Optional[str] = None
    video_player_url: Optional[str] = None
    status_code: Optional[str] = None
    days_in_stock: Optional[int] = None
    image_url: Optional[List[str]] = None

class InventoryItemUpdate(CamelModel):
    # Same as above, all Optional
    stocknumber: Optional[str] = None
    vin: Optional[str] = None
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    sellingprice: Optional[float] = None
    msrp: Optional[float] = None
    mileage: Optional[int] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    certified: Optional[bool] = None
    type: Optional[str] = None
    drive_type: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    cylinders: Optional[int] = None
    displacement: Optional[float] = None
    descriptions: Optional[str] = None
    date_added: Optional[datetime] = None
    link: Optional[str] = None
    image_link: Optional[str] = None
    additional_image_link: Optional[str] = None
    dealership_name: Optional[str] = None
    dealership_address: Optional[str] = None
    primary_key: Optional[str] = None
    primary_key_raw: Optional[str] = None
    video_player_url: Optional[str] = None
    status_code: Optional[str] = None
    days_in_stock: Optional[int] = None
    image_url: Optional[List[str]] = None

