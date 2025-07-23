from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app

client = TestClient(app)


def test_get_full_ai_context():
    inventory_rows = [
        {
            "id": "1",
            "year": 2024,
            "make": "Ford",
            "model": "F-150",
            "trim": "XL",
            "mileage": 10,
            "price": 35000,
            "stocknumber": "F1",
        }
    ]
    comps_rows = [
        {
            "source": "cars.com",
            "year": 2024,
            "make": "Ford",
            "model": "F-150",
            "trim": "XL",
            "mileage": 20,
            "price": 34000,
            "url": "http://example.com",
            "created_at": "2024-01-01T00:00:00",
        }
    ]
    tasks_rows = [
        {
            "id": "1",
            "customer_id": "55555555-5555-5555-5555-555555555555",
            "description": "Call back",
            "due_date": "2024-01-02T00:00:00",
            "completed": False,
            "assigned_to": "Bob",
        }
    ]
    acts_rows = [
        {
            "id": "2",
            "subject": "Test Drive",
            "scheduled_at": "2024-01-01T00:00:00",
            "performed_at": None,
            "customer_id": "55555555-5555-5555-5555-555555555555",
        }
    ]
    leads_rows = [
        {
            "id": "3",
            "name": "Alice",
            "email": "a@example.com",
            "phone": "123",
            "source": "Web",
            "created_at": "2024-01-05T00:00:00",
        }
    ]

    mock_inv_table = MagicMock()
    mock_inv_table.select.return_value.execute.return_value = MagicMock(
        data=inventory_rows, error=None
    )

    mock_comps_table = MagicMock()
    (
        mock_comps_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value
    ) = MagicMock(data=comps_rows, error=None)

    mock_tasks_table = MagicMock()
    (
        mock_tasks_table.select.return_value.eq.return_value.lt.return_value.order.return_value.limit.return_value.execute.return_value
    ) = MagicMock(data=tasks_rows, error=None)

    mock_acts_table = MagicMock()
    (
        mock_acts_table.select.return_value.is_.return_value.lt.return_value.order.return_value.limit.return_value.execute.return_value
    ) = MagicMock(data=acts_rows, error=None)

    mock_leads_table = MagicMock()
    (
        mock_leads_table.select.return_value.order.return_value.limit.return_value.execute.return_value
    ) = MagicMock(data=leads_rows, error=None)

    def table_side_effect(name):
        if name == "ai_inventory_context":
            return mock_inv_table
        if name == "market_comps":
            return mock_comps_table
        if name == "tasks":
            return mock_tasks_table
        if name == "activities":
            return mock_acts_table
        if name == "leads":
            return mock_leads_table
        return MagicMock()

    mock_supabase = MagicMock()
    mock_supabase.table.side_effect = table_side_effect

    with patch("app.openai_router.supabase", mock_supabase):
        response = client.get("/api/ai/context/full")

    assert response.status_code == 200
    data = response.json()
    assert data["inventory"][0]["comps"] == comps_rows
    assert data["overdue"]["tasks"] == tasks_rows
    assert data["overdue"]["activities"] == acts_rows
    assert data["hot_leads"] == leads_rows
    assert "inventory_block" in data["ai_context_blocks"]
