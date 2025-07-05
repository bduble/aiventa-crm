from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app

client = TestClient(app)


def test_today_metrics():
    sample = [
        {"type": "call"},
        {"type": "text"},
        {"type": "appointment"},
        {"type": "call"},
    ]

    exec_result = MagicMock(data=sample, error=None)
    mock_table = MagicMock()
    mock_table.select.return_value.gte.return_value.lt.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.activities.supabase", mock_supabase):
        response = client.get("/api/activities/today-metrics")

    assert response.status_code == 200
    assert response.json() == {
        "sales_calls": 2,
        "text_messages": 1,
        "appointments_set": 1,
    }
