from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from uuid import UUID
from datetime import datetime
from typing import List

from app.db import get_db_session
from app.db_models import CustomerSignal, AIHotness
from app.schemas import SignalIn, AiHotnessResponse, BreakdownItem

router = APIRouter()

@router.post(
    "/customers/{id}/signals",
    status_code=status.HTTP_201_CREATED,
)
def ingest_signal(
    id: UUID,
    payload: SignalIn,
    db: Session = Depends(get_db_session),
):
    signal = CustomerSignal(
        customer_id=customer_id,
        signal_type=payload.type,
        signal_value=payload.value,
        meta=payload.metadata,
    )
    db.add(signal)
    db.commit()
    return {"status": "ok"}


@router.get(
    "/customers/{id}/ai-hotness",
    response_model=AiHotnessResponse,
)
def get_ai_hotness(
    customer_id: UUID,
    db: Session = Depends(get_db_session),
):
    signals = db.execute(
        select(
            CustomerSignal.signal_type,
            func.sum(CustomerSignal.signal_value).label("total_value")
        )
        .where(CustomerSignal.customer_id == customer_id)
        .group_by(CustomerSignal.signal_type)
    ).all()

    if not signals:
        raise HTTPException(404, "No signals found for this customer")

    weights = {
        "quote_request": 0.30,
        "web_visit": 0.10,
        "service_visit": 0.15,
        "positive_equity": 0.20,
        "sentiment_score": 0.25,
    }

    breakdown: List[BreakdownItem] = []
    raw_score = 0.0
    for sig in signals:
        wt = weights.get(sig.signal_type, 0.0)
        contrib = float(sig.total_value) * wt
        breakdown.append(
            BreakdownItem(
                signal_type=sig.signal_type,
                weight=wt,
                contribution=contrib,
            )
        )
        raw_score += contrib

    score = max(0.0, min(raw_score, 100.0))

    now = datetime.utcnow()
    db.merge(
        AIHotness(
            customer_id=customer_id,
            score=score,
            breakdown=[item.dict() for item in breakdown],
            computed_at=now,
        )
    )
    db.commit()

    return AiHotnessResponse(
        customer_id=customer_id,
        score=score,
        breakdown=breakdown,
        computed_at=now,
    )
