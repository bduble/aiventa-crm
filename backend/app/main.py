from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.leads import router as leads_router
from .routers.users import router as users_router

app = FastAPI(title="Aiventa CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads_router)
app.include_router(users_router)

@app.get("/")
def read_root():
    return {"message": "Hello, Aiventa CRM!"}
