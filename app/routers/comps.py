from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.comp_check import aggregate_comps

router = APIRouter()


@router.get("/comps/search")
def comps_search(year: int, make: str, model: str, trim: str | None = None,
                 zipcode: str = "76504", radius: int = 200):
    result = aggregate_comps(year, make, model, trim, zipcode, radius)
    return JSONResponse(content=result)

