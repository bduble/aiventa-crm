import time
import requests
from datetime import datetime
from supabase import create_client, Client
from bs4 import BeautifulSoup

# Configure your Supabase client
SUPABASE_URL = "https://ckdwsvviiuhyqzroswfe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZHdzdnZpaXVoeXF6cm9zd2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ5NzM4OCwiZXhwIjoyMDY1MDczMzg4fQ.nJo4Oz4ak7LTPsnMzcaea0zF1nOXS-ZYpEBUGBarOHY"  # use service key for backend jobs!
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_cars_com(year, make, model, trim, zipcode, radius=200):
    url = f"https://www.cars.com/shopping/results/?stock_type=used&makes[]={make}&models[]={model}&year_min={year}&year_max={year}&zip={zipcode}&radius={radius}"
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; aiVentaBot/1.0)",
    }
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")
        comps = []
        for card in soup.select("[data-test='vehicleCard']"):
            try:
                price = card.select_one("[data-test='vehicleCardPricingBlockPrice']").text.strip().replace("$", "").replace(",", "")
                mileage = card.select_one("[data-test='vehicleMileage']").text.strip().replace(",", "").replace(" mi.", "")
                title = card.select_one("h2").text.strip()
                vehicle_url = "https://www.cars.com" + card.select_one("a")["href"]

                comps.append({
                    "year": year,
                    "make": make,
                    "model": model,
                    "trim": trim,
                    "mileage": int(mileage) if mileage.isdigit() else None,
                    "price": int(price) if price.isdigit() else None,
                    "source": "Cars.com",
                    "url": vehicle_url
                })
            except Exception as parse_e:
                continue
        print(f"Fetched {len(comps)} comps for {year} {make} {model}")
        return comps
    except Exception as e:
        print(f"Failed to fetch comps for {year} {make} {model}: {e}")
        return []


def fetch_inventory():
    res = supabase.table("ai_inventory_context").select("*").execute()
    return res.data or []

def save_market_comp(inventory_id, comp):
    data = {
        "inventory_id": inventory_id,
        "source": comp.get("source"),
        "year": comp.get("year"),
        "make": comp.get("make"),
        "model": comp.get("model"),
        "trim": comp.get("trim"),
        "mileage": comp.get("mileage"),
        "price": comp.get("price"),
        "url": comp.get("url"),
        "created_at": datetime.utcnow().isoformat()
    }
    supabase.table("market_comps").insert(data).execute()

def comp_fetcher_job():
    vehicles = fetch_inventory()
    for vehicle in vehicles:
        inventory_id = vehicle["id"]
        comps = scrape_cars_com(
            year=vehicle["year"],
            make=vehicle["make"],
            model=vehicle["model"],
            trim=vehicle.get("trim"),
            zipcode="76502"  # Or pull from vehicle or config
        )
        if comps:
            # Delete old comps for this inventory, if desired:
            supabase.table("market_comps").delete().eq("inventory_id", inventory_id).execute()
            # Save new comps
            for comp in comps:
                save_market_comp(inventory_id, comp)
        time.sleep(2)  # Respectful delay between scrapes (throttle as needed)

if __name__ == "__main__":
    comp_fetcher_job()
    # For a scheduler, run every hour/day, or use schedule module/Render Jobs
