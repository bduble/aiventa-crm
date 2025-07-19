from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app

client = TestClient(app)


def test_list_deals():
    sample = [{
        "id": 1,
        "customer_id": 1,
        "vehicle": "Car",
        "trade": None,
        "amount": None,
        "stage": "new",
        "status": None,
        "notes": None,
        "salesperson": None,
        "sold": None,
        "close_date": None,
    }]
    exec_result = MagicMock(data=sample, error=None)
    mock_table = MagicMock()
    mock_table.select.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.deals.supabase", mock_supabase):
        response = client.get("/api/deals/")

    assert response.status_code == 200
    assert response.json() == sample


def test_get_deal():
    sample = {
        "id": 1,
        "customer_id": 1,
        "vehicle": "Car",
        "trade": None,
        "amount": None,
        "stage": "new",
        "status": None,
        "notes": None,
        "salesperson": None,
        "sold": None,
        "close_date": None,
    }
    exec_result = MagicMock(data=sample, error=None)
    mock_select = MagicMock()
    mock_select.eq.return_value.maybe_single.return_value.execute.return_value = exec_result
    mock_table = MagicMock()
    mock_table.select.return_value = mock_select
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.deals.supabase", mock_supabase):
        response = client.get("/api/deals/1")

    assert response.status_code == 200
    assert response.json() == sample
    mock_select.eq.assert_called_with("id", 1)


def test_create_deal():
    payload = {"customer_id": 1, "vehicle": "Car"}
    sample = {
        "id": 1,
        "customer_id": 1,
        "vehicle": "Car",
        "trade": None,
        "amount": None,
        "stage": "new",
        "status": None,
        "notes": None,
        "salesperson": None,
        "sold": None,
        "close_date": None,
    }
    exec_result = MagicMock(data=[sample], error=None)
    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.deals.supabase", mock_supabase):
        response = client.post("/api/deals/", json=payload)

    assert response.status_code == 201
    assert response.json() == sample


def test_update_deal():
    sample = {
        "id": 1,
        "customer_id": 1,
        "vehicle": "New Car",
        "trade": None,
        "amount": None,
        "stage": "new",
        "status": None,
        "notes": None,
        "salesperson": None,
        "sold": None,
        "close_date": None,
    }
    exec_result = MagicMock(data=[sample], error=None)
    mock_table = MagicMock()
    mock_table.update.return_value.eq.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.deals.supabase", mock_supabase):
        response = client.patch("/api/deals/1", json={"vehicle": "New Car"})

    assert response.status_code == 200
    assert response.json() == sample

