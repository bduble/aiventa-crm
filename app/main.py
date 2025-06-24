# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.leads           import router as leads_router
from app.routers.users           import router as users_router
from app.routers.floor_traffic   import router as floor_traffic_router
from app.routers.accounts        import router as accounts_router
from app.routers.contacts        import router as contacts_router
from app.routers.opportunities   import router as opportunities_router
from app.routers.activities      import router as activities_router

app = FastAPI(title="aiVenta CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # lock this down in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to aiVenta!"}

@app.get("/healthz", tags=["root"])
async def health_check():
    return {"status": "ok"}

# Mount all your API routers under /api
app.include_router(leads_router,       prefix="/api/leads",         tags=["leads"])
app.include_router(users_router,       prefix="/api/users",         tags=["users"])
app.include_router(                      # <— floor-traffic now at /api/floor-traffic
    floor_traffic_router,
)
app.include_router(accounts_router,    prefix="/api/accounts",      tags=["accounts"])
app.include_router(contacts_router,    prefix="/api/contacts",      tags=["contacts"])
app.include_router(opportunities_router, prefix="/api/opportunities", tags=["opportunities"])
app.include_router(activities_router,  prefix="/api/activities",    tags=["activities"])

# Serve the React app for any unhandled GET route
app.mount(
    "/",
    StaticFiles(directory="frontend/dist", html=True),
    name="frontend",
)
