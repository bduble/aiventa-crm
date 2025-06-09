from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import leads, users

app = FastAPI(title="Aiventa CRM API")

# Allow your frontend origin (or "*" for testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aiventa-crm.vercel.app"],  # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Hello, Aiventa CRM!"}
    
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv(".env")  # load SUPABASE_URL & SUPABASE_KEY

SUPA_URL = os.getenv("SUPABASE_URL")
SUPA_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPA_URL, SUPA_KEY)
