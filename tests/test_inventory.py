from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
import json

client = TestClient(app)


def test_list_inventory():
    sample = [{"id": 1, "stockNumber": "A123"}]
    exec_result = MagicMock(data=sample, error=None)
    mock_table = MagicMock()
    mock_table.select.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.inventory.supabase", mock_supabase):
        response = client.get("/api/inventory/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert data[0]["stockNumber"] == "A123"


def test_create_inventory():
    sample = {"id": 1, "stockNumber": "A123"}
    exec_result = MagicMock(data=[sample], error=None)
    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    payload = {"stockNumber": "A123"}
    with patch("app.routers.inventory.supabase", mock_supabase):
        response = client.post(
            "/api/inventory/",
            content=json.dumps(payload),
            headers={"Content-Type": "application/json"},
        )

    assert response.status_code == 201
    data = response.json()
    assert data["stockNumber"] == "A123"


def test_filter_inventory_query_params():
    sample = [{"id": 2, "make": "Ford"}]
    exec_result = MagicMock(data=sample, error=None)

    mock_query = MagicMock()
    mock_query.ilike.return_value = mock_query
    mock_query.gte.return_value = mock_query
    mock_query.execute.return_value = exec_result

    mock_table = MagicMock()
    mock_table.select.return_value = mock_query
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.inventory.supabase", mock_supabase):
        response = client.get("/api/inventory/?make=Ford&year_min=2020")

    assert response.status_code == 200
    data = response.json()
    assert data[0]["make"] == "Ford"
    mock_query.ilike.assert_called_with("make", "%Ford%")
    mock_query.gte.assert_called_with("year", 2020)
