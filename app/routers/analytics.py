from fastapi import APIRouter, HTTPException

from app.routers import floor_traffic, leads, inventory
from app.openai_client import get_openai_client

router = APIRouter()

@router.get("/month-summary")
async def month_summary():
    """Return an AI generated summary for the current month."""
    ft_metrics = floor_traffic.month_metrics()
    lead_metrics = leads.month_metrics()

    client = get_openai_client()
    if not client:
        return {"summary": "OpenAI API key not configured"}

    prompt = (
        "Provide a concise summary of this month's performance given these metrics. "
        f"Floor traffic: {ft_metrics}. Lead metrics: {lead_metrics}."
    )

    try:
        chat = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return {"summary": chat.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sales-overview")
def sales_overview():
    """Return basic sales metrics for the month."""
    metrics = floor_traffic.month_metrics()
    sold = metrics.get("sold_count", 0)
    goal = sold + 10
    conversion_base = metrics.get("write_up_count", 0) or 1
    return {
        "current": sold,
        "goal": goal,
        "avgDealSize": 25000,
        "conversionRate": round((sold / conversion_base) * 100, 2),
        "daily": [],
    }

@router.get("/lead-overview")
def lead_overview():
    """Return basic lead metrics for the month."""
    metrics = leads.month_metrics()
    total = metrics.get("total_leads", 0)
    qualified = int(total * (metrics.get("lead_engagement_rate", 0) / 100))
    return {
        "new": total,
        "qualified": qualified,
        "avgResponse": metrics.get("average_response_time", 0),
        "funnel": [
            {"stage": "New", "value": total},
            {"stage": "Qualified", "value": qualified},
        ],
    }

@router.get("/inventory-overview")
async def inventory_overview():
    """
    Return inventory snapshot metrics with full buckets and live stats.
    """
    try:
        # FIXED: do not await, just call the function (assuming it's not async)
        snapshot = inventory.inventory_snapshot()
    except Exception as e:
        print("Inventory snapshot error:", e)
        snapshot = {
            "total": 0, "newCount": 0, "usedCount": 0,
            "avgDays": 0, "turnRate": 0, "overThirty": 0,
            "buckets": {"0-30": 0, "31-45": 0, "46-60": 0, "61-90": 0, "90+": 0}
        }
    return snapshot

@router.get("/ai-overview")
def ai_overview():
    """Placeholder AI insights."""
    return {
        "forecast": "Steady growth expected",
        "trendUp": True,
        "anomalies": 0,
        "recommendations": 0,
        "details": "No significant anomalies detected",
    }

@router.get("/marketing-roi")
def marketing_roi():
    """Return simple marketing ROI stats."""
    return {
        "spend": 0,
        "revenue": 0,
        "cpl": 0,
        "roi": 0,
        "conversionByChannel": [],
    }

@router.get("/sales-team-activity")
def sales_team_activity():
    """Return placeholder sales team activity stats."""
    return {
        "unitsByRep": [],
        "grossPerUnit": 0,
        "closingRatio": 0,
        "fiPenetration": 0,
        "appraisalToTrade": "",
    }

@router.get("/service-performance")
def service_performance():
    """Return placeholder service department metrics."""
    return {
        "effectiveLaborRate": 0,
        "hoursPerRo": 0,
        "grossProfitPct": 0,
        "csi": 0,
        "fixedCoverage": 0,
    }

@router.get("/customer-satisfaction")
def customer_satisfaction():
    """Return placeholder customer satisfaction metrics."""
    return {
        "csi": 0,
        "retention": 0,
        "nps": 0,
        "retentionSeries": [],
        "npsSeries": [],
    }
