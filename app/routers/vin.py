# app/routers/vin.py
import requests
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/decode/{vin}")
def decode_vin(vin: str):
    """Decode a VIN using NHTSA's free public API. Returns key vehicle fields for autofill."""
    vin = vin.strip().upper()
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json"

    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print("VIN decode error:", e)
        raise HTTPException(status_code=400, detail="Failed to reach NHTSA VIN API.")

    data = resp.json()
    if not data or "Results" not in data:
        raise HTTPException(status_code=400, detail="No results from VIN decoder.")

    def get_var(var):
        val = next((r.get('Value') for r in data["Results"] if r.get("Variable") == var), None)
        if val and val not in ["Not Applicable", "0", ""]:
            return val
        return None

    # Main fields for appraisal form auto-fill
    return {
        "year": get_var("Model Year"),
        "make": get_var("Make"),
        "model": get_var("Model"),
        "trim": get_var("Trim"),
        "body": get_var("Body Class"),
        "engine": get_var("Engine Model") or get_var("Engine Manufacturer"),
        "fuel_type": get_var("Fuel Type Primary"),
        "series": get_var("Series"),
        "doors": get_var("Doors"),
        # You can always add more fields below as needed!
        # "plant": get_var("Plant Country"),
        # "gvwr": get_var("GVWR"),
        # etc.
    }
