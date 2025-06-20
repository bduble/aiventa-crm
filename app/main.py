from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.leads import router as leads_router
from app.routers.users import router as users_router
from app.routers.floor_traffic import router as floor_traffic_router
from app.routers.accounts import router as accounts_router
from app.routers.contacts import router as contacts_router
from app.routers.opportunities import router as opportunities_router
from app.routers.activities import router as activities_router

app = FastAPI(title="aiVenta CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to aiVenta!"}

@app.get("/healthz", tags=["root"])
async def health_check():
    return {"status": "ok"}

# API Routers
app.include_router(leads_router,         prefix="/leads",         tags=["leads"])
app.include_router(users_router,         prefix="/users",         tags=["users"])
app.include_router(floor_traffic_router, prefix="/floor-traffic", tags=["floor-traffic"])
app.include_router(accounts_router,      prefix="/accounts",      tags=["accounts"])
app.include_router(contacts_router,      prefix="/contacts",      tags=["contacts"])
app.include_router(opportunities_router, prefix="/opportunities", tags=["opportunities"])
app.include_router(activities_router,    prefix="/activities",    tags=["activities"])

# Serve React app (make sure you've run `npm run build` in frontend/)
app.mount(
    "/", 
    StaticFiles(directory="frontend/dist", html=True), 
    name="frontend"
)
