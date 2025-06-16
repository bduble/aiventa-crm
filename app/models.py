# app/models.py

from typing import Optional
from pydantic import BaseModel, EmailStr


class LeadBase(BaseModel):
    name: str
    email: EmailStr        # will validate “foo@bar.com” shape


class LeadCreate(LeadBase):
    """
    Schema for incoming POST /leads/ bodies.
    Just inherits name & email from LeadBase.
    """
    pass


class Lead(LeadBase):
    """
    What we return from GET /leads/ (and POST /leads/).
    Adds the auto-generated `id` field.
    """
    id: int

    class Config:
        orm_mode = True
