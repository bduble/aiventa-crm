from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
import json

client = TestClient(app)


def test_get_today_floor_traffic():
    sample = [{
        "id": 1,
        "salesperson": "Bob",
        "customer_name": "Alice",
        "first_name": None,
        "last_name": None,
        "email": None,
        "phone": None,
        "visit_time": "2024-01-01T09:00:00",
        "notes": None,
        "created_at": "2024-01-01T09:00:00"
    }]

    exec_result = MagicMock(data=sample, error=None)
    mock_table = MagicMock()
    mock_table.select.return_value.gte.return_value.lt.return_value.order.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.floor_traffic.supabase", mock_supabase):
        response = client.get("/api/floor-traffic/today")

    assert response.status_code == 200
    assert response.json() == sample


def test_create_floor_traffic():
    sample = {
        "id": 1,
        "salesperson": "Bob",
        "customer_name": "Alice",
        "first_name": None,
        "last_name": None,
        "email": None,
        "phone": None,
        "visit_time": "2024-01-01T10:00:00",
        "notes": None,
        "created_at": "2024-01-01T10:00:00",
    }

    exec_result = MagicMock(data=[sample], error=None)
    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    payload = {
        "timeIn": sample["visit_time"],
        "salesperson": sample["salesperson"],
        "customerName": sample["customer_name"],
        "visit_time": sample["visit_time"],
        "customer_name": sample["customer_name"],
    }

    with patch("app.routers.floor_traffic.supabase", mock_supabase):
        response = client.post(
            "/api/floor-traffic/",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 201
    assert response.json() == sample
