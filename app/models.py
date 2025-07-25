from datetime import date, datetime
from typing import Optional, List, Literal, Union
from pydantic import BaseModel, EmailStr, validator, Field, ConfigDict

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
    lead_id: Optional[str]
    account_id: Optional[str]
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
    id: str
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
    stage: str
    amount: Optional[float]

class OpportunityCreate(BaseModel):
    account_id: str
    name: str
    stage: str
    amount: Optional[float]

class OpportunityUpdate(BaseModel):
    name: Optional[str]
    account_id: Optional[str]
    contact_id: Optional[str]
    stage: Optional[str]
    amount: Optional[float]
    close_date: Optional[date]

# ── Activities ─────────────────────────────────────────────────────────────────
class Activity(BaseModel):
    id: str
    activity_type: str
    subject: Optional[str] = None
    note: Optional[str] = None
    customer_id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    related_lead_id: Optional[str] = None
    related_contact_id: Optional[str] = None
    related_account_id: Optional[str] = None
    related_opportunity_id: Optional[str] = None

class ActivityCreate(BaseModel):
    activity_type: str
    subject: Optional[str] = None
    note: Optional[str]
    customer_id: Optional[str] = None
    user_id: Optional[str] = None
    related_lead_id: Optional[str] = None
    related_contact_id: Optional[str] = None
    related_account_id: Optional[str] = None
    related_opportunity_id: Optional[str] = None

class ActivityUpdate(BaseModel):
    customer_id: Optional[str] = None
    contact_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    activity_type: Optional[str] = None
    subject: Optional[str] = None
    note: Optional[str] = None
    user_id: Optional[str] = None
    date: Optional[date] = None

# ── Floor Traffic Log ─────────────────────────────────────────────────────────
class FloorTrafficCustomer(BaseModel):
    id: str
    salesperson: str
    name: str = Field(alias="customer_name")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    visit_time: datetime
    time_out: Optional[datetime] = None
    demo: Optional[bool] = None
    worksheet: Optional[bool] = None
    customer_offer: Optional[bool] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)

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
    status: Optional[str] = None
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
    status: Optional[str] = None
    notes: Optional[str] = None

class CustomerFloorTrafficCreate(BaseModel):
    visit_time: datetime
    salesperson: str
    demo: Optional[bool] = None
    worksheet: Optional[bool] = None
    customer_offer: Optional[bool] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    time_out: Optional[datetime] = None

# ── Inventory ─────────────────────────────────────────────────────────────────

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

class CamelModel(BaseModel):
    model_config = ConfigDict(validate_by_name=True, alias_generator=to_camel)

class InventoryItem(CamelModel):
    id: str
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
    additional_image_link_1: Optional[str] = None
    additional_image_link_2: Optional[str] = None
    additional_image_link_3: Optional[str] = None
    additional_image_link_4: Optional[str] = None
    additional_image_link_5: Optional[str] = None
    additional_image_link_6: Optional[str] = None
    additional_image_link_7: Optional[str] = None
    additional_image_link_8: Optional[str] = None
    dealership_name: Optional[str] = None
    dealership_address: Optional[str] = None
    primary_key: Optional[str] = None
    primary_key_raw: Optional[str] = None
    video_player_url: Optional[str] = Field(None, alias="VideoPlayerURL")
    status_code: Optional[str] = Field(None, alias="StatusCode")
    days_in_stock: Optional[int] = Field(None, alias="Days In Stock")
    image_url: Optional[str] = Field(None, alias="Image URL")
    vehicle_option: Optional[str] = None
    version_mod_date: Optional[datetime] = Field(None, alias="Version_Mod.Date")
    vehicle_type: Optional[str] = None

class InventoryItemCreate(CamelModel):
    # Same as InventoryItem, minus id and plus all optionals for creation.
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
    additional_image_link_1: Optional[str] = None
    additional_image_link_2: Optional[str] = None
    additional_image_link_3: Optional[str] = None
    additional_image_link_4: Optional[str] = None
    additional_image_link_5: Optional[str] = None
    additional_image_link_6: Optional[str] = None
    additional_image_link_7: Optional[str] = None
    additional_image_link_8: Optional[str] = None
    dealership_name: Optional[str] = None
    dealership_address: Optional[str] = None
    primary_key: Optional[str] = None
    primary_key_raw: Optional[str] = None
    video_player_url: Optional[str] = Field(None, alias="VideoPlayerURL")
    status_code: Optional[str] = Field(None, alias="StatusCode")
    days_in_stock: Optional[int] = Field(None, alias="Days In Stock")
    image_url: Optional[str] = Field(None, alias="Image URL")
    vehicle_option: Optional[str] = None
    version_mod_date: Optional[datetime] = Field(None, alias="Version_Mod.Date")
    vehicle_type: Optional[str] = None

class InventoryItemUpdate(CamelModel):
    # All fields optional for PATCH
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
    additional_image_link_1: Optional[str] = None
    additional_image_link_2: Optional[str] = None
    additional_image_link_3: Optional[str] = None
    additional_image_link_4: Optional[str] = None
    additional_image_link_5: Optional[str] = None
    additional_image_link_6: Optional[str] = None
    additional_image_link_7: Optional[str] = None
    additional_image_link_8: Optional[str] = None
    dealership_name: Optional[str] = None
    dealership_address: Optional[str] = None
    primary_key: Optional[str] = None
    primary_key_raw: Optional[str] = None
    video_player_url: Optional[str] = Field(None, alias="VideoPlayerURL")
    status_code: Optional[str] = Field(None, alias="StatusCode")
    days_in_stock: Optional[int] = Field(None, alias="Days In Stock")
    image_url: Optional[str] = Field(None, alias="Image URL")
    vehicle_option: Optional[str] = None
    version_mod_date: Optional[datetime] = Field(None, alias="Version_Mod.Date")
    vehicle_type: Optional[str] = None

# ── Appraisals ───────────────────────────────────────────────────────────────
class DamageReport(BaseModel):
    dents: Optional[int] = 0
    scratches: Optional[int] = 0
    tire: Optional[str] = None

class AppraisalBase(BaseModel):
    customer_id: Optional[str] = None    # <-- Optional!
    vehicle_vin: str
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    mileage: Optional[int] = None
    exterior_color: Optional[str] = None
    interior_color: Optional[str] = None
    engine: Optional[str] = None
    transmission: Optional[str] = None
    drivetrain: Optional[str] = None
    condition_score: Optional[float] = None
    damage_report: Optional[DamageReport] = None
    notes: Optional[str] = None
    appraisal_value: Optional[float] = None
    actual_acv: Optional[float] = None
    payoff_amount: Optional[float] = None
    status: Optional[Literal["Draft", "Final", "Rejected"]] = "Draft"

class AppraisalCreate(AppraisalBase):
    pass  # inherits customer_id: Optional[str] = None

class Appraisal(AppraisalBase):
    id: str
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# ── Deals ─────────────────────────────────────────────────────────────────
class DealBase(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    vehicle: Optional[str] = None
    trade: Optional[str] = None
    amount: Optional[float] = None
    stage: Optional[str] = "new"
    status: Optional[str] = None
    notes: Optional[str] = None
    salesperson: Optional[str] = None
    sold: Optional[bool] = None
    close_date: Optional[str] = None

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    vehicle: Optional[str] = None
    trade: Optional[str] = None
    amount: Optional[float] = None
    stage: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    salesperson: Optional[str] = None
    sold: Optional[bool] = None
    close_date: Optional[str] = None

class Deal(DealBase):
    id: str

# ── Users ───────────────────────────────────────────────────────────────
class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    is_active: Optional[bool] = True
    role: Optional[str] = None        # e.g., 'admin', 'sales', etc.
    phone: Optional[str] = None
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str                     # Only on create (omit from regular User model)
    role: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None    # Optional for PATCH
    is_active: Optional[bool] = None
    role: Optional[str] = None
    phone: Optional[str] = None
