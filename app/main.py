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
from app.routers.customers       import router as customers_router
from app.routers.opportunities   import router as opportunities_router
from app.routers.activities      import router as activities_router
from app.routers import inventory  # inventory router mounted under /api/inventory
from app.routers.chat            import router as chat_router
from app.routers.telephony       import router as telephony_router
from app.routers.analytics       import router as analytics_router

app = FastAPI(title="aiVenta CRM API")

# 1️⃣ CORS: allow origins from env or detected deployment URLs
def build_allowed_origins() -> list[str]:
    origins = [
        o.strip().rstrip("/")
        for o in os.environ.get("CORS_ORIGINS", "").split(",")
        if o.strip()
    ]

    if frontend_url := os.environ.get("FRONTEND_URL"):
        origins.append(frontend_url.strip().rstrip("/"))

    # Include hosting platform URLs automatically so CORS works out-of-the-box
    if vercel_url := os.environ.get("VERCEL_URL"):
        origins.append(f"https://{vercel_url.strip().rstrip('/')}")
    if render_url := os.environ.get("RENDER_EXTERNAL_URL"):
        origins.append(f"https://{render_url.strip().rstrip('/')}")

    # Remove duplicates while preserving order
    seen = set()
    deduped = []
    for o in origins:
        if o not in seen:
            deduped.append(o)
            seen.add(o)
    return deduped or ["*"]

allowed_origins = build_allowed_origins()

allow_credentials = False if "*" in allowed_origins else True
allow_regex = None if "*" in allowed_origins else r"https://.*\.vercel\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_regex,
    allow_credentials=allow_credentials,
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
app.include_router(customers_router,     prefix="/api/customers",     tags=["customers"])
app.include_router(opportunities_router, prefix="/api/opportunities", tags=["opportunities"])
app.include_router(activities_router,    prefix="/api/activities",    tags=["activities"])
# now include your inventory router
app.include_router(
    inventory.router,
    prefix="/api/inventory",
    tags=["inventory"],
)
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(telephony_router, prefix="/api/telephony", tags=["telephony"])

# 4️⃣ Serve your React app for all other GETs
app.mount(
    "/",
    StaticFiles(directory="frontend/dist", html=True),
    name="frontend"
)
