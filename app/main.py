from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import leads, users

app = FastAPI()

# 🎯 add this:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # or ["https://my.frontend.com"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(users.router)