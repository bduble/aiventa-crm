# app/routers/tasks.py
from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError
from app.db import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class TaskCreate(BaseModel):
    customer_id: int
    title: str
    description: Optional[str]
    due_date: Optional[str]   # ISO format date string
    completed: Optional[bool] = False
    assigned_to: Optional[str]
    status: Optional[str] = "open"

class Task(TaskCreate):
    id: int

@router.get("/", response_model=list[Task])
@router.get("", response_model=list[Task], include_in_schema=False)
def list_tasks(customer_id: Optional[int] = None):
    try:
        query = supabase.table("tasks").select("*")
        if customer_id:
            query = query.eq("customer_id", customer_id)
        res = query.execute()
        return res.data or []
    except APIError as e:
        raise HTTPException(400, detail=e.message)

@router.post("/", response_model=Task)
@router.post("", response_model=Task, include_in_schema=False)
def create_task(task: TaskCreate):
    try:
        res = supabase.table("tasks").insert(task.dict()).execute()
        return res.data[0]
    except APIError as e:
        raise HTTPException(400, detail=e.message)
