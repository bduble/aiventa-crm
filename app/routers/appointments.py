# app/routers/appointments.py
from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError
from app.db import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class AppointmentCreate(BaseModel):
    customer_id: str
    appointment_type: Optional[str]
    start_time: str         # ISO datetime string
    end_time: Optional[str] # ISO datetime string
    notes: Optional[str]
    status: Optional[str] = "scheduled"

class Appointment(AppointmentCreate):
    id: int

@router.get("/", response_model=list[Appointment])
@router.get("", response_model=list[Appointment], include_in_schema=False)
def list_appointments(customer_id: Optional[str] = None):
    try:
        query = supabase.table("appointments").select("*")
        if customer_id:
            query = query.eq("customer_id", customer_id)
        res = query.execute()
        return res.data or []
    except APIError as e:
        raise HTTPException(400, detail=e.message)

@router.post("/", response_model=Appointment)
@router.post("", response_model=Appointment, include_in_schema=False)
def create_appointment(appt: AppointmentCreate):
    try:
        res = supabase.table("appointments").insert(appt.dict()).execute()
        return res.data[0]
    except APIError as e:
        raise HTTPException(400, detail=e.message)
