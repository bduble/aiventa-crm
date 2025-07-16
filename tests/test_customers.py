from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import json
from app.main import app
client = TestClient(app)


def test_search_customers():
    sample = [{
        "id": 1,
        "name": "Alice",
        "email": "a@example.com",
        "phone": "123",
    }]
    exec_result = MagicMock(data=sample, error=None)

    mock_query = MagicMock()
    mock_query.ilike.return_value = mock_query
    mock_query.execute.return_value = exec_result

    mock_table = MagicMock()
    mock_table.select.return_value = mock_query
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.customers.supabase", mock_supabase):
        response = client.get("/api/customers/?q=Ali")

    assert response.status_code == 200
    assert response.json() == sample
    mock_query.ilike.assert_any_call("name", "%Ali%")


def test_get_customer():
    sample = {
        "id": 1,
        "name": "Alice",
        "email": "a@example.com",
        "phone": "123",
    }
    exec_result = MagicMock(data=sample, error=None)

    mock_select = MagicMock()
    mock_select.eq.return_value.maybe_single.return_value.execute.return_value = exec_result

    mock_table = MagicMock()
    mock_table.select.return_value = mock_select
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.customers.supabase", mock_supabase):
        response = client.get("/api/customers/1")

    assert response.status_code == 200
    assert response.json() == sample
    mock_select.eq.assert_called_with("id", 1)


def test_add_customer_to_floor_log_be_back():
    customer = {
        "id": 1,
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "a@example.com",
        "phone": "123",
        "name": "Alice Smith",
    }

    inserted = {
        "id": "101",
        "salesperson": "Bob",
        "first_name": "Alice",
        "last_name": "Smith",
        "customer_name": "Alice Smith",
        "email": "a@example.com",
        "phone": "123",
        "visit_time": "2024-01-10T10:00:00",
        "time_out": None,
        "demo": None,
        "worksheet": None,
        "customer_offer": None,
        "status": "Be-Back",
        "notes": None,
        "created_at": "2024-01-10T10:00:00",
    }

    mock_customer_table = MagicMock()
    (
        mock_customer_table.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value
    ) = MagicMock(data=customer, error=None)

    mock_floor_table = MagicMock()
    (
        mock_floor_table.select.return_value.eq.return_value.eq.return_value.gte.return_value.limit.return_value.execute.return_value
    ) = MagicMock(data=[{"id": "old"}], error=None)
    mock_floor_table.insert.return_value.execute.return_value = MagicMock(data=[inserted], error=None)

    def table_side_effect(name):
        if name == "customers":
            return mock_customer_table
        elif name == "floor_traffic_customers":
            return mock_floor_table
        return MagicMock()

    mock_supabase = MagicMock()
    mock_supabase.table.side_effect = table_side_effect

    payload = {"visit_time": inserted["visit_time"], "salesperson": "Bob"}

    with patch("app.routers.customers.supabase", mock_supabase):
        response = client.post(
            "/api/customers/1/floor-traffic",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 201
    assert response.json() == inserted
