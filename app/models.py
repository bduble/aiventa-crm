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
