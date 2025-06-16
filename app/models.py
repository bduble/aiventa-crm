# app/models.py

from typing import Optional
from pydantic import BaseModel, EmailStr


class LeadBase(BaseModel):
    name: str
    email: EmailStr


class LeadCreate(LeadBase):
    pass


class Lead(LeadBase):
    id: int

    class Config:
        orm_mode = True


# ────────────────────────────────────────────────────────────────


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str     # plain-text in—will hash before saving


class User(UserBase):
    id: int

    class Config:
        orm_mode = True

# ── after Lead and User models ──

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, AnyHttpUrl

class AccountBase(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[AnyHttpUrl] = None
    description: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[AnyHttpUrl] = None
    description: Optional[str] = None

class Account(AccountBase):
    id: int
    inserted_at: datetime

    class Config:
        orm_mode = True

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, condecimal

# ── below your Contact models ──

class OpportunityBase(BaseModel):
    name: str
    account_id: Optional[int] = None
    contact_id: Optional[int] = None
    amount: condecimal(max_digits=12, decimal_places=2) = Decimal("0.00")
    stage: Optional[str] = "Prospecting"
    close_date: Optional[date] = None

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(BaseModel):
    name: Optional[str] = None
    account_id: Optional[int] = None
    contact_id: Optional[int] = None
    amount: Optional[condecimal(max_digits=12, decimal_places=2)] = None
    stage: Optional[str] = None
    close_date: Optional[date] = None

class Opportunity(OpportunityBase):
    id: int
    inserted_at: datetime

    class Config:
        orm_mode = True
