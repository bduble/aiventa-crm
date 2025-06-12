from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import leads, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ← Add this back in:
@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to aiVenta!"}

app.include_router(leads.router, prefix="/leads", tags=["leads"])
app.include_router(users.router, prefix="/users", tags=["users"])
