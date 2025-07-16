from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import json
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


def test_create_activity_with_user():
    sample = {
        "id": "1",
        "activity_type": "call",
        "subject": "Call",
        "note": "Test",
        "customer_id": 1,
        "user_id": 5,
    }
    exec_result = MagicMock(data=[sample], error=None)
    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    payload = {
        "activity_type": "call",
        "subject": "Call",
        "note": "Test",
        "customer_id": 1,
        "user_id": 5,
    }
    with patch("app.routers.activities.supabase", mock_supabase):
        response = client.post(
            "/api/activities/",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 201
    data = response.json()
    assert data["activity_type"] == "call"
    assert data["user_id"] == 5
    mock_table.insert.assert_called_with(payload)
