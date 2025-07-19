import time
import requests
from datetime import datetime
from supabase import create_client, Client
from bs4 import BeautifulSoup

# --- CONFIG ---
SUPABASE_URL = "https://ckdwsvviiuhyqzroswfe.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"  # Replace with your actual key!
ZIP_CODE = "76502"
SCRAPE_RADIUS = 200  # miles

# --- INIT ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

def scrape_cars_com(year, make, model, trim, zipcode, radius=SCRAPE_RADIUS, max_results=20):
    """Scrape used car comps from Cars.com."""
    base_url = "https://www.cars.com/shopping/results/"
    params = {
        "stock_type": "used",
        "makes[]": make.lower(),
        "models[]": model.lower(),
        "maximum_distance": radius,
        "zip": zipcode,
        "year_min": year,
        "year_max": year,
        "page_size": max_results,
        "sort": "best_match_desc",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items() if v)
    url = f"{base_url}?{query}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    try:
        print("Scraping:", url)
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code != 200:
            print(f"Non-200 response: {r.status_code}")
            return []
        robot_keywords = ["are you a robot", "unusual traffic", "verify you are human", "access denied", "captcha"]
        if any(k in r.text.lower() for k in robot_keywords):
            print("⚠️  Bot or CAPTCHA detected!")
            with open("carscom_blocked.html", "w", encoding="utf-8") as f:
                f.write(r.text)
            return []
        soup = BeautifulSoup(r.text, "lxml")
        comps = []
        for card in soup.select("[data-test='vehicleCard']"):
            try:
                price = card.select_one("[data-test='vehicleCardPricingBlockPrice']").text.strip().replace("$", "").replace(",", "")
                mileage = card.select_one("[data-test='vehicleMileage']").text.strip().replace(",", "").replace(" mi.", "")
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
            except Exception:
                continue
        print(f"Fetched {len(comps)} comps for {year} {make} {model}")
        return comps
    except Exception as e:
        print(f"Failed to fetch comps for {year} {make} {model}: {e}")
        return []

def comp_fetcher_job():
    vehicles = fetch_inventory()
    print(f"Found {len(vehicles)} vehicles.")
    for vehicle in vehicles:
        inventory_id = vehicle["id"]
        comps = scrape_cars_com(
            year=vehicle["year"],
            make=vehicle["make"],
            model=vehicle["model"],
            trim=vehicle.get("trim"),
            zipcode=ZIP_CODE
        )
        if comps:
            supabase.table("market_comps").delete().eq("inventory_id", inventory_id).execute()
            for comp in comps:
                save_market_comp(inventory_id, comp)
        time.sleep(2)  # To be polite!

if __name__ == "__main__":
    comp_fetcher_job()
