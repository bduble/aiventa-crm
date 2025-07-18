import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any


def scrape_cars_com(year: int, make: str, model: str, trim: str | None = None,
                    zipcode: str = "76504", radius: int = 200,
                    max_results: int = 15) -> List[Dict[str, Any]]:
    """Scrape used car listings from Cars.com."""
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
    headers = {"User-Agent": "Mozilla/5.0"}
    print("Scraping URL:", url)
    r = requests.get(url, headers=headers, timeout=30)
    soup = BeautifulSoup(r.text, "html.parser")
    cars = []
    for listing in soup.select("div.vehicle-card"):
        try:
            title = listing.select_one("h2.title").get_text(strip=True)
            price_el = listing.select_one("span.primary-price")
            price = price_el.get_text(strip=True) if price_el else "N/A"
            mileage_el = listing.select_one("div.mileage")
            mileage = mileage_el.get_text(strip=True) if mileage_el else "N/A"
            location_el = listing.select_one("div.dealer-name")
            location = location_el.get_text(strip=True) if location_el else "N/A"
            link = "https://www.cars.com" + listing.select_one("a.vehicle-card-link")['href']
            trim_info = " ".join(title.split()[3:]) if len(title.split()) > 3 else "N/A"
            car = {
                "source": "Cars.com",
                "year_make_model": title,
                "year": title.split()[0],
                "make": title.split()[1],
                "model": title.split()[2],
                "trim": trim_info,
                "mileage": mileage,
                "price": price.replace("$", "").replace(",", ""),
                "location": location,
                "url": link,
            }
            if trim and trim.lower() not in car["trim"].lower():
                continue
            cars.append(car)
        except Exception:
            continue
    return cars


def scrape_cargurus(year: int, make: str, model: str, trim: str | None = None,
                    zipcode: str = "76504", radius: int = 200,
                    max_results: int = 15) -> List[Dict[str, Any]]:
    """Scrape used car listings from CarGurus."""
    search_url = "https://www.cargurus.com/Cars/inventorylisting/viewDetailsFilterViewInventoryListing.action"
    params = {
        "zip": zipcode,
        "distance": radius,
        "entitySelectingHelper.selectedEntity": f"{year}_{make}_{model}",
    }
    r = requests.get(search_url, params=params, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
    soup = BeautifulSoup(r.text, "html.parser")
    cars = []
    for listing in soup.select("div.ListingListing__listingCard"):
        try:
            title = listing.select_one("h4.listingTitle").get_text(strip=True)
            price_el = listing.select_one("span.price")
            price = price_el.get_text(strip=True) if price_el else "N/A"
            mileage_el = listing.select_one("div.Mileage")
            mileage = mileage_el.get_text(strip=True) if mileage_el else "N/A"
            location_el = listing.select_one("div.Location")
            location = location_el.get_text(strip=True) if location_el else "N/A"
            link = "https://www.cargurus.com" + listing.select_one("a")['href']
            trim_info = " ".join(title.split()[3:]) if len(title.split()) > 3 else "N/A"
            car = {
                "source": "CarGurus",
                "year_make_model": title,
                "year": title.split()[0],
                "make": title.split()[1],
                "model": title.split()[2],
                "trim": trim_info,
                "mileage": mileage,
                "price": price.replace("$", "").replace(",", ""),
                "location": location,
                "url": link,
            }
            if trim and trim.lower() not in car["trim"].lower():
                continue
            cars.append(car)
        except Exception:
            continue
    return cars


def scrape_autotrader(year: int, make: str, model: str, trim: str | None = None,
                      zipcode: str = "76504", radius: int = 200,
                      max_results: int = 15) -> List[Dict[str, Any]]:
    """Scrape used car listings from Autotrader."""
    search_url = f"https://www.autotrader.com/cars-for-sale/{make}/{model}/{zipcode}"
    params = {
        "searchRadius": radius,
        "startYear": year,
        "endYear": year,
        "numRecords": max_results,
    }
    r = requests.get(search_url, params=params, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
    soup = BeautifulSoup(r.text, "html.parser")
    cars = []
    for listing in soup.select("div.inventory-listing"):
        try:
            title = listing.select_one("h2.title").get_text(strip=True)
            price_el = listing.select_one("span.first-price")
            price = price_el.get_text(strip=True) if price_el else "N/A"
            mileage_el = listing.select_one("div.text-bold.text-size-200")
            mileage = mileage_el.get_text(strip=True) if mileage_el else "N/A"
            location_el = listing.select_one("div.text-bold.text-size-100")
            location = location_el.get_text(strip=True) if location_el else "N/A"
            link = "https://www.autotrader.com" + listing.select_one("a")['href']
            trim_info = " ".join(title.split()[3:]) if len(title.split()) > 3 else "N/A"
            car = {
                "source": "Autotrader",
                "year_make_model": title,
                "year": title.split()[0],
                "make": title.split()[1],
                "model": title.split()[2],
                "trim": trim_info,
                "mileage": mileage,
                "price": price.replace("$", "").replace(",", ""),
                "location": location,
                "url": link,
            }
            if trim and trim.lower() not in car["trim"].lower():
                continue
            cars.append(car)
        except Exception:
            continue
    return cars


def clean_price(p: Any) -> int | None:
    try:
        return int(str(p).replace(",", "").replace("$", "").strip())
    except Exception:
        return None


def remove_outliers(cars: List[Dict[str, Any]], key: str = "price", percent: float = 0.1) -> List[Dict[str, Any]]:
    prices = sorted([clean_price(c[key]) for c in cars if clean_price(c[key])])
    if not prices:
        return cars
    n = len(prices)
    lower = int(n * percent)
    upper = n - lower
    filtered_prices = set(prices[lower:upper])
    return [c for c in cars if clean_price(c[key]) in filtered_prices]


def aggregate_comps(year: int, make: str, model: str, trim: str | None = None,
                    zipcode: str = "76504", radius: int = 200) -> Dict[str, Any]:
    comps: List[Dict[str, Any]] = []
    comps += scrape_cars_com(year, make, model, trim, zipcode, radius)
    comps += scrape_cargurus(year, make, model, trim, zipcode, radius)
    comps += scrape_autotrader(year, make, model, trim, zipcode, radius)

    seen = set()
    unique = []
    for c in comps:
        key = (c["year_make_model"], c["mileage"], c["price"], c["location"])
        if key not in seen and c["price"] not in ["N/A", "", None]:
            seen.add(key)
            unique.append(c)

    filtered = remove_outliers(unique)
    price_list = [clean_price(c["price"]) for c in filtered if clean_price(c["price"])]
    avg = int(sum(price_list) / len(price_list)) if price_list else 0
    lo = min(price_list) if price_list else 0
    hi = max(price_list) if price_list else 0
    return {
        "comps": filtered,
        "market_avg": avg,
        "market_low": lo,
        "market_high": hi,
    }


def format_for_manager(vehicle: Dict[str, Any], result: Dict[str, Any]) -> str:
    comps = result["comps"]
    avg = result["market_avg"]
    lo = result["market_low"]
    hi = result["market_high"]
    market_band = f"${lo:,}–${hi:,}"
    user_price = clean_price(vehicle.get("price", "N/A"))
    gap = user_price - avg if user_price and avg else 0
    flag = (
        "OVERPRICED" if user_price and user_price > hi else
        "UNDERPRICED" if user_price and user_price < lo else
        "IN MARKET RANGE"
    )
    lines = [
        f"Market comps for {vehicle['year']} {vehicle['make']} {vehicle['model']} {vehicle.get('trim','')}:",
        f"- Your price: ${user_price:,} | Market avg: ${avg:,} | Most comps: {market_band} | Status: {flag}",
        "Sample comps:",
    ]
    for c in comps[:5]:
        lines.append(
            f"{c['year_make_model']} | {c['trim']} | {c['mileage']} mi | ${c['price']} | {c['location']} | [{c['source']}]({c['url']})"
        )
    return "\n".join(lines)


def format_for_customer(result: Dict[str, Any]) -> str:
    comps = result["comps"][:5]
    lines = [
        "Why Our Price is a Smart Deal\n",
        "| Year | Make | Model | Trim | Miles | Price | Location | Source |",
        "|------|------|-------|------|-------|-------|----------|--------|",
    ]
    for c in comps:
        lines.append(
            f"| {c['year']} | {c['make']} | {c['model']} | {c['trim']} | {c['mileage']} | ${c['price']} | {c['location']} | [{c['source']}]({c['url']}) |"
        )
    return "\n".join(lines)

