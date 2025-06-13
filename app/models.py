from typing import Optional
from pydantic import BaseModel

class Lead(BaseModel):
    id: int
    name: str
    email: Optional[str]

class LeadCreate(BaseModel):
    name: str
    email: Optional[str]
