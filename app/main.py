# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles

from app.routers.leads           import router as leads_router
from app.routers.users           import router as users_router
from app.routers import floor_traffic
from app.routers.accounts        import router as accounts_router
from app.routers.contacts        import router as contacts_router
from app.routers.opportunities   import router as opportunities_router
from app.routers.activities      import router as activities_router
from app.routers import inventory  # inventory router mounted under /api/inventory

app = FastAPI(title="aiVenta CRM API")

# 1️⃣ CORS: allow origins from env or default to production domain
origins_env = os.environ.get("CORS_ORIGINS", "https://aiventa-crm.vercel.app, http://localhost:3000")
allowed_origins = [
    o.strip().rstrip("/")
    for o in origins_env.split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
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
# mount floor-traffic as before
app.include_router(
    floor_traffic.router,
    prefix="/api/floor-traffic",
    tags=["floor-traffic"],
)
app.include_router(accounts_router,      prefix="/api/accounts",      tags=["accounts"])
app.include_router(contacts_router,      prefix="/api/contacts",      tags=["contacts"])
app.include_router(opportunities_router, prefix="/api/opportunities", tags=["opportunities"])
app.include_router(activities_router,    prefix="/api/activities",    tags=["activities"])
# now include your inventory router
app.include_router(
    inventory.router,
    prefix="/api/inventory",
    tags=["inventory"],
)

# 4️⃣ Serve your React app for all other GETs
app.mount(
    "/",
    StaticFiles(directory="frontend/dist", html=True),
    name="frontend"
)
