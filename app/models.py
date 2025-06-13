# app/models.py
from pydantic import BaseModel

class Lead(BaseModel):
    id: int
    name: str
    email: str
    # … whatever fields your “leads” table has

class LeadCreate(BaseModel):
    name: str
    email: str
    # omit the id (it’ll be generated server-side)
