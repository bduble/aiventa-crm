from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles

from app.routers.leads           import router as leads_router
from app.routers.users           import router as users_router
from app.routers import floor_traffic
from app.routers.accounts        import router as accounts_router
from app.routers.contacts        import router as contacts_router
from app.routers.customers       import router as customers_router
from app.routers.opportunities   import router as opportunities_router
from app.routers.activities      import router as activities_router
from app.routers import inventory  # inventory router mounted under /api/inventory
from app.routers.chat            import router as chat_router
from app.routers.telephony       import router as telephony_router
from app.routers.analytics       import router as analytics_router

app = FastAPI(title="aiVenta CRM API")

# 1️⃣ CORS: allow your front-end and render origin
allowed_origins = [
    "https://aiventa-crm.vercel.app",
    "https://aiventa-crm.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 2️⃣ Health‐checks
@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to aiVenta!"}

@app.get("/healthz", tags=["root"])
async def health_check():
    return {"status": "ok"}

# 3️⃣ Mount API routers under /api/*
app.include_router(leads_router,         prefix="/api/leads",         tags=["leads"])
app.include_router(users_router,         prefix="/api/users",         tags=["users"])
app.include_router(
    floor_traffic.router,
    prefix="/api/floor-traffic",
    tags=["floor-traffic"],
)
app.include_router(accounts_router,      prefix="/api/accounts",      tags=["accounts"])
app.include_router(contacts_router,      prefix="/api/contacts",      tags=["contacts"])
app.include_router(customers_router,     prefix="/api/customers",     tags=["customers"])
app.include_router(opportunities_router, prefix="/api/opportunities", tags=["opportunities"])
app.include_router(activities_router,    prefix="/api/activities",    tags=["activities"])
app.include_router(
    inventory.router,
    prefix="/api/inventory",
    tags=["inventory"],
)
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(chat_router,      prefix="/api/chat",       tags=["chat"])
app.include_router(telephony_router, prefix="/api/telephony",  tags=["telephony"])

# 4️⃣ Serve your React app for all other GETs
app.mount(
    "/",
    StaticFiles(directory="frontend/dist", html=True),
    name="frontend"
)
