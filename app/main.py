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

@app.get("/", tags=["root"])
def read_root():
    return {"message": "Welcome to aiVenta!"}     # ← added closing brace and parenthesis

app.include_router(leads.router, prefix="/leads", tags=["leads"])
app.include_router(users.router, prefix="/users", tags=["users"])

from app.routers import users

# after app = FastAPI() and middleware...
app.include_router(users.router, prefix="/users", tags=["users"])

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import leads, users, accounts, contacts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
def read_root():
    return {"message": "Welcome to aiVenta!"}

app.include_router(leads.router,    prefix="/leads",    tags=["leads"])
app.include_router(users.router,    prefix="/users",    tags=["users"])
app.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
app.include_router(contacts.router, prefix="/contacts", tags=["contacts"])

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import leads, users, accounts, contacts, opportunities

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
def read_root():
    return {"message": "Welcome to aiVenta!"}

app.include_router(leads.router,         prefix="/leads",         tags=["leads"])
app.include_router(users.router,         prefix="/users",         tags=["users"])
app.include_router(accounts.router,      prefix="/accounts",      tags=["accounts"])
app.include_router(contacts.router,      prefix="/contacts",      tags=["contacts"])
app.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    leads,
    users,
    accounts,
    contacts,
    opportunities,
    activities,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
def read_root():
    return {"message": "Welcome to aiVenta!"}

app.include_router(leads.router,         prefix="/leads",          tags=["leads"])
app.include_router(users.router,         prefix="/users",          tags=["users"])
app.include_router(accounts.router,      prefix="/accounts",       tags=["accounts"])
app.include_router(contacts.router,      prefix="/contacts",       tags=["contacts"])
app.include_router(opportunities.router, prefix="/opportunities",  tags=["opportunities"])
app.include_router(activities.router,    prefix="/activities",     tags=["activities"])
