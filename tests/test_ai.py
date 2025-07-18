from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from app.main import app
import json

client = TestClient(app)


def test_ai_ask_inventory_keyword():
    sample = [
        {"year": 2025, "make": "Mazda", "model": "CX-5", "vin": "123", "status": "in stock"}
    ]
    exec_result = MagicMock(data=sample, error=None)

    mock_select = MagicMock()
    mock_select.limit.return_value.execute.return_value = exec_result

    mock_table = MagicMock()
    mock_table.select.return_value = mock_select

    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    mock_resp = MagicMock(choices=[MagicMock(message=MagicMock(content="ok"))])
    mock_openai = MagicMock()
    mock_openai.chat.completions.create = AsyncMock(return_value=mock_resp)

    with patch("app.openai_router.supabase", mock_supabase), \
         patch("app.openai_router.get_openai_client", return_value=mock_openai):
        response = client.post(
            "/api/ai/ask",
            content=json.dumps({"question": "Show me the inventory"}),
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 200
    assert response.json() == {"answer": "ok"}
    mock_supabase.table.assert_called_with("ai_inventory_context")
    mock_table.select.assert_called_with("*")
    mock_openai.chat.completions.create.assert_called_once()


def test_inventory_ai_review():
    vehicle = {
        "id": 1,
        "year": 2024,
        "make": "Ford",
        "model": "F-150",
        "trim": "XL",
        "sellingprice": 30000,
        "mileage": 10000,
    }
    exec_result = MagicMock(data=vehicle, error=None)
    mock_chain = MagicMock()
    mock_chain.eq.return_value = mock_chain
    mock_chain.maybe_single.return_value = mock_chain
    mock_chain.execute.return_value = exec_result

    mock_table = MagicMock()
    mock_table.select.return_value = mock_chain

    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    comps_result = {
        "comps": [
            {"price": 31000},
            {"price": 32000},
        ],
        "market_avg": 31500,
        "market_low": 30000,
        "market_high": 33000,
    }

    mock_resp = MagicMock(
        choices=[MagicMock(message=MagicMock(content="Looks good"))]
    )
    mock_openai = MagicMock()
    mock_openai.chat.completions.create = AsyncMock(return_value=mock_resp)

    with patch("app.openai_router.supabase", mock_supabase), \
         patch("app.openai_router.aggregate_comps", return_value=comps_result), \
         patch("app.openai_router.get_openai_client", return_value=mock_openai):
        response = client.get("/api/ai/inventory/1/review")

    assert response.status_code == 200
    data = response.json()
    assert data["num_available"] == 2
    assert data["market_avg"] == 31500
    assert data["analysis"] == "Looks good"
