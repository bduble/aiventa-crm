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
    mock_table.select.assert_called_with("year,make,model,vin,status")
    mock_openai.chat.completions.create.assert_called_once()
