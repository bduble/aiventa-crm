from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app

client = TestClient(app)


def test_list_leads():
    sample = [{"id": 1, "name": "Alice", "email": "alice@example.com"}]
    exec_result = MagicMock(data=sample, error=None)

    mock_table = MagicMock()
    mock_table.select.return_value.execute.return_value = exec_result
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.leads.supabase", mock_supabase):
        response = client.get("/api/leads/")

    assert response.status_code == 200
    assert response.json() == sample
