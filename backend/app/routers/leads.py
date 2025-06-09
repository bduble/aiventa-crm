from fastapi import APIRouter

router = APIRouter(prefix="/leads", tags=["leads"])

@router.get("/")
async def list_leads():
    return [{"id":1,"name":"Sample Lead"}]
