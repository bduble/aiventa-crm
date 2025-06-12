from fastapi import FastAPI
from app.routers import leads, users

app = FastAPI()

app.include_router(leads.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Hello, Aiventa CRM!"}