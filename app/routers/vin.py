# app/routers/vin.py

import requests
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/decode/{vin}")
def decode_vin(vin: str):
    """
    Decode a VIN using NHTSA's free public API.
    Returns key vehicle fields for autofill.
    """
    vin = vin.strip().upper()
    if len(vin) != 17:
        raise HTTPException(status_code=400, detail="VIN must be 17 characters.")

    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json"

    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print("VIN decode error:", e)
        raise HTTPException(status_code=502, detail="Failed to reach NHTSA VIN API.")

    data = resp.json()
    if not data or "Results" not in data or not isinstance(data["Results"], list):
        raise HTTPException(status_code=502, detail="No results from VIN decoder.")

    def get_var(var):
        val = next(
            (r.get('Value') for r in data["Results"] if r.get("Variable") == var), None
        )
        # Filter out unhelpful values
        if val and val not in ["Not Applicable", "0", "", None]:
            return val
        return None

    result = {
        "year": get_var("Model Year"),
        "make": get_var("Make"),
        "model": get_var("Model"),
        "trim": get_var("Trim"),
        "body": get_var("Body Class"),
        "engine": get_var("Engine Model") or get_var("Engine Manufacturer"),
        "fuel_type": get_var("Fuel Type - Primary"),
        "series": get_var("Series"),
        "doors": get_var("Doors"),
        # Uncomment or add more fields as needed:
        # "plant": get_var("Plant Country"),
        # "gvwr": get_var("GVWR"),
    }

    # If no useful decode, return 404
    if not any([result["year"], result["make"], result["model"]]):
        raise HTTPException(status_code=404, detail="Could not decode this VIN.")

    return result
