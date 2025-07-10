from fastapi import APIRouter, HTTPException

from app.routers import floor_traffic, leads
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

