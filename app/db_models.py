from sqlalchemy import Column, String, Float, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class CustomerSignal(Base):
    __tablename__ = "customer_signals"
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(PGUUID(as_uuid=True), nullable=False)
    signal_type = Column(String, nullable=False)
    signal_value = Column(Float, nullable=False)
    meta = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIHotness(Base):
    __tablename__ = "ai_hotness"
    customer_id = Column(PGUUID(as_uuid=True), primary_key=True)
    score = Column(Float, nullable=False)
    breakdown = Column(JSON, nullable=False)
    computed_at = Column(DateTime, nullable=False)
