# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# ── Import routers ──────────────────────────────────────────────────────────
from app.routers.leads          import router as leads_router
from app.routers.users          import router as users_router
from app.routers.floor_traffic  import router as floor_traffic_router
from app.routers.accounts       import router as accounts_router
from app.routers.contacts       import router as contacts_router
from app.routers.customers      import router as customers_router
from app.routers.opportunities  import router as opportunities_router
from app.routers.activities     import router as activities_router
from app.routers.inventory      import router as inventory_router
from app.routers.chat           import router as chat_router
from app.routers.telephony      import router as telephony_router
from app.routers.analytics      import router as analytics_router
from app.routers.tasks          import router as tasks_router
from app.routers.appointments   import router as appointments_router
from app.routers.deals          import router as deals_router
from app.routers.comps          import router as comps_router    # ← NEW
from app.routers.search         import router as search_router
from app.openai_router          import router as ai_router       # ← NEW

# ── App init ────────────────────────────────────────────────────────────────
app = FastAPI(title="aiVenta CRM API")

# ── Dynamic CORS whitelist ─────────────────────────────────────────────────
def build_allowed_origins() -> list[str]:
    env_val = os.getenv("CORS_ORIGINS", "")
    origins = [o.strip().rstrip("/") for o in env_val.split(",") if o.strip()]

    if frontend := os.getenv("FRONTEND_URL"):
        origins.append(frontend.strip().rstrip("/"))

    if vercel := os.getenv("VERCEL_URL"):
        origins.append(f"https://{vercel.strip().rstrip('/')}")

    if render := os.getenv("RENDER_EXTERNAL_URL"):
        origins.append(f"https://{render.strip().rstrip('/')}")

    # dedupe while preserving order
    seen, deduped = set(), []
    for o in origins:
        if o not in seen:
            deduped.append(o)
            seen.add(o)

    return deduped or ["*"]

allowed_origins   = build_allowed_origins()
allow_credentials = False if "*" in allowed_origins else True
allow_origin_regex = None if "*" in allowed_origins else r"https://.*\.vercel\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins     = allowed_origins,
    allow_origin_regex= allow_origin_regex,
    allow_credentials = allow_credentials,
    allow_methods     = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers     = ["*"],
)

# ── Health endpoints ───────────────────────────────────────────────────────
@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to aiVenta!"}

@app.get("/healthz", tags=["root"])
async def health_check():
    return {"status": "ok"}

# ── API routers (@ /api/*) ─────────────────────────────────────────────────
api_prefix = "/api"

app.include_router(leads_router,         prefix=f"{api_prefix}/leads",        tags=["leads"])
app.include_router(users_router,         prefix=f"{api_prefix}/users",        tags=["users"])
app.include_router(floor_traffic_router, prefix=f"{api_prefix}/floor-traffic",tags=["floor-traffic"])
app.include_router(accounts_router,      prefix=f"{api_prefix}/accounts",     tags=["accounts"])
app.include_router(contacts_router,      prefix=f"{api_prefix}/contacts",     tags=["contacts"])
app.include_router(customers_router,     prefix=f"{api_prefix}/customers",    tags=["customers"])
app.include_router(opportunities_router, prefix=f"{api_prefix}/opportunities",tags=["opportunities"])
app.include_router(activities_router,    prefix=f"{api_prefix}/activities",   tags=["activities"])
app.include_router(inventory_router,     prefix=f"{api_prefix}/inventory",    tags=["inventory"])
app.include_router(chat_router,          prefix=f"{api_prefix}/chat",         tags=["chat"])
app.include_router(telephony_router,     prefix=f"{api_prefix}/telephony",    tags=["telephony"])
app.include_router(analytics_router,     prefix=f"{api_prefix}/analytics",    tags=["analytics"])
app.include_router(tasks_router,         prefix=f"{api_prefix}/tasks",        tags=["tasks"])
app.include_router(appointments_router,  prefix=f"{api_prefix}/appointments", tags=["appointments"])
app.include_router(deals_router,         prefix=f"{api_prefix}/deals",        tags=["deals"])
app.include_router(comps_router,         prefix=f"{api_prefix}",              tags=["comps"])
app.include_router(search_router,        prefix=f"{api_prefix}",              tags=["search"])

# NEW: AI assistant routes (POST /api/ai/ask, GET /api/ai/ask-stream)
app.include_router(ai_router,            prefix=f"{api_prefix}",              tags=["ai"])

print(app.routes) 
# ── Serve React build (catch-all) ───────────────────────────────────────────
# Placed LAST so it doesn’t shadow API routes.
app.mount(
    "/",
    StaticFiles(directory="frontend/dist", html=True),
    name="frontend",
)
