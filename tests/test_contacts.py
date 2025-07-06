from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
client = TestClient(app)


def test_search_contacts():
    sample = [{
        "id": "1",
        "name": "Alice",
        "email": "a@example.com",
        "phone": "123",
        "lead_id": None,
        "account_id": None,
    }]
    exec_result = MagicMock(data=sample, error=None)

    mock_query = MagicMock()
    mock_query.ilike.return_value = mock_query
    mock_query.execute.return_value = exec_result

    mock_table = MagicMock()
    mock_table.select.return_value = mock_query
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.contacts.supabase", mock_supabase):
        response = client.get("/api/contacts/?q=Ali")

    assert response.status_code == 200
    assert response.json() == sample
    mock_query.ilike.assert_any_call("name", "%Ali%")


def test_get_contact():
    sample = {
        "id": "1",
        "name": "Alice",
        "email": "a@example.com",
        "phone": "123",
        "lead_id": 2,
        "account_id": None,
    }
    exec_result = MagicMock(data=sample, error=None)

    mock_select = MagicMock()
    mock_select.eq.return_value.maybe_single.return_value.execute.return_value = exec_result

    mock_table = MagicMock()
    mock_table.select.return_value = mock_select
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.contacts.supabase", mock_supabase):
        response = client.get("/api/contacts/1")

    assert response.status_code == 200
    assert response.json() == sample
    mock_select.eq.assert_called_with("id", 1)

