import time
import random
import requests
from datetime import datetime
from supabase import create_client, Client
from bs4 import BeautifulSoup

# --- SUPABASE SETUP ---
SUPABASE_URL = "https://ckdwsvviiuhyqzroswfe.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"  # Replace with your secure key!
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- USER AGENTS & HEADERS ---
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
]
HEADERS = {
    "referer": "https://www.cars.com/",
    "accept-language": "en-US,en;q=0.9"
}

def get_headers():
    return {**HEADERS, "User-Agent": random.choice(USER_AGENTS)}

# --- SCRAPE FUNCTION ---
def scrape_cars_com(year, make, model, trim, zipcode, radius=200, max_results=20):
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

    for attempt in range(3):
        try:
            print(f"Scraping (try {attempt+1}): {url}")
            r = requests.get(url, headers=get_headers(), timeout=30)
            if r.status_code != 200:
                print(f"Non-200 response: {r.status_code}")
                continue
            lowered = r.text.lower()
            if any(k in lowered for k in ["are you a robot", "unusual traffic", "captcha", "verify you are human"]):
                print("⚠️  Blocked/Captcha, sleeping & retrying...")
                time.sleep(5 * (attempt+1))
                continue

            soup = BeautifulSoup(r.text, "lxml")
            cards = soup.select("[data-test='vehicleCard']")
            if not cards:
                print("⚠️ No vehicle cards found! Saving HTML for debug...")
                with open("carscom_noresults.html", "w", encoding="utf-8") as f:
                    f.write(r.text)
                continue

            comps = []
            for card in cards:
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
                        "mileage": int(mileage) if mileage.replace(",","").isdigit() else None,
                        "price": int(price) if price.replace(",","").isdigit() else None,
                        "source": "Cars.com",
                        "url": vehicle_url
                    })
                except Exception as e:
                    print("Parse fail:", e)
                    continue
            print(f"Fetched {len(comps)} comps for {year} {make} {model}")
            return comps
        except Exception as e:
            print("General fail:", e)
            time.sleep(3 * (attempt+1))
    return []

# --- SUPABASE HELPERS ---
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

# --- MAIN JOB ---
def comp_fetcher_job():
    vehicles = fetch_inventory()
    print(f"Found {len(vehicles)} vehicles in inventory.")
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
            for comp in comps:
                save_market_comp(inventory_id, comp)
        time.sleep(2 + random.randint(0, 3))  # Randomized throttle!

if __name__ == "__main__":
    comp_fetcher_job()
