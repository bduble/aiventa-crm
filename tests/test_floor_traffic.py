from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
import json

client = TestClient(app)


def test_get_today_floor_traffic():
    sample = [{
        "id": "1",
        "salesperson": "Bob",
        "customer_name": "Alice",
        "first_name": None,
        "last_name": None,
        "email": None,
        "phone": None,
        "visit_time": "2024-01-01T09:00:00",
        "time_out": None,
        "demo": None,
        "worksheet": None,
        "customer_offer": None,
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
        "id": "1",
        "salesperson": "Bob",
        "customer_name": "Alice",
        "first_name": None,
        "last_name": None,
        "email": None,
        "phone": None,
        "visit_time": "2024-01-01T10:00:00",
        "time_out": None,
        "demo": None,
        "worksheet": None,
        "customer_offer": None,
        "notes": None,
        "created_at": "2024-01-01T10:00:00",
    }

    exec_result = MagicMock(data=[sample], error=None)

    mock_ft_table = MagicMock()
    mock_ft_table.insert.return_value.execute.return_value = exec_result

    mock_contacts_table = MagicMock()
    mock_contacts_table.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": 99}], error=None
    )

    def table_side_effect(name):
        if name == "floor_traffic_customers":
            return mock_ft_table
        elif name == "contacts":
            return mock_contacts_table
        return MagicMock()

    mock_supabase = MagicMock()
    mock_supabase.table.side_effect = table_side_effect

    payload = {
        "timeIn": sample["visit_time"],
        "salesperson": sample["salesperson"],
        "customerName": sample["customer_name"],
        "visit_time": sample["visit_time"],
        "customer_name": sample["customer_name"],
        "first_name": "Alice",
        "last_name": "Smith",
    }

    with patch("app.routers.floor_traffic.supabase", mock_supabase):
        response = client.post(
            "/api/floor-traffic/",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 201
    assert response.json() == sample
    assert mock_contacts_table.insert.called


def test_update_floor_traffic():
    sample = {
        "id": "1",
        "salesperson": "Bob",
        "customer_name": "Alice",
        "first_name": None,
        "last_name": None,
        "email": None,
        "phone": None,
        "visit_time": "2024-01-01T10:00:00",
        "time_out": None,
        "demo": None,
        "worksheet": None,
        "customer_offer": None,
        "notes": "Updated",
        "created_at": "2024-01-01T10:00:00",
    }

    exec_result = MagicMock(data=[sample], error=None)
    mock_table = MagicMock()
    mock_table.update.return_value.eq.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.floor_traffic.supabase", mock_supabase):
        response = client.put(
            "/api/floor-traffic/1",
            content=json.dumps({"notes": "Updated"}),
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 200
    assert response.json() == sample


def test_month_metrics():
    sample = [
        {"demo": True, "worksheet": True, "customer_offer": True, "sold": False},
        {"demo": False, "worksheet": False, "customer_offer": False, "sold": True},
    ]

    exec_result = MagicMock(data=sample, error=None)
    mock_table = MagicMock()
    (
        mock_table.select.return_value.gte.return_value.lt.return_value.execute.return_value
    ) = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.floor_traffic.supabase", mock_supabase):
        response = client.get("/api/floor-traffic/month-metrics")

    assert response.status_code == 200
    assert response.json() == {
        "total_customers": 2,
        "demo_count": 1,
        "worksheet_count": 1,
        "customer_offer_count": 1,
        "sold_count": 1,
    }


def test_search_floor_traffic():
    sample = [
        {
            "id": "1",
            "salesperson": "Bob",
            "customer_name": "Alice",
            "first_name": None,
            "last_name": None,
            "email": None,
            "phone": None,
            "visit_time": "2024-01-05T09:00:00",
            "time_out": None,
            "demo": None,
            "worksheet": None,
            "customer_offer": None,
            "notes": None,
            "created_at": "2024-01-05T09:00:00",
        }
    ]

    exec_result = MagicMock(data=sample, error=None)
    mock_table = MagicMock()
    (
        mock_table.select.return_value.gte.return_value.lt.return_value.order.return_value.execute.return_value
    ) = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.floor_traffic.supabase", mock_supabase):
        response = client.get(
            "/api/floor-traffic/search?start=2024-01-05&end=2024-01-05"
        )

    assert response.status_code == 200
    assert response.json() == sample
