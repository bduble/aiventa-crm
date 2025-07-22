# app/routers/vin.py
import requests
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/decode/{vin}")
def decode_vin(vin: str):
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json"
    resp = requests.get(url)
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to decode VIN")
    data = resp.json()
    # Build a dict for easy use in the frontend
    def find_val(key):
        for r in data['Results']:
            if r['Variable'] == key:
                return r['Value']
        return None
    return {
        "year": find_val("Model Year"),
        "make": find_val("Make"),
        "model": find_val("Model"),
        "trim": find_val("Trim"),
        "body": find_val("Body Class"),
        "engine": find_val("Engine Model") or find_val("Engine Manufacturer"),
        "fuel_type": find_val("Fuel Type Primary"),
        "series": find_val("Series"),
        "doors": find_val("Doors"),
    }
