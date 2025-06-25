from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .routers.leads import router as leads_router
from .routers.users import router as users_router

app = FastAPI(title="Aiventa CRM API")

origins_env = os.environ.get("CORS_ORIGINS", "https://aiventa-crm.vercel.app")
allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads_router)
app.include_router(users_router)

@app.get("/")
def read_root():
    return {"message": "Hello, Aiventa CRM!"}
