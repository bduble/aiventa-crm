from pydantic import BaseModel
from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime

class SignalIn(BaseModel):
    type: str
    value: float
    metadata: Dict[str, Any] = {}

class BreakdownItem(BaseModel):
    signal_type: str
    weight: float
    contribution: float

class AiHotnessResponse(BaseModel):
    customer_id: UUID
    score: float  # 0–100
    breakdown: List[BreakdownItem]
    computed_at: datetime
