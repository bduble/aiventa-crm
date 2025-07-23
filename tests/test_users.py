from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app

client = TestClient(app)


def test_create_user_accepts_name_alias():
    payload = {"name": "Alice", "email": "alice@example.com"}
    inserted = {"id": "1", "name": "Alice", "email": "alice@example.com"}
    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value = MagicMock(data=[inserted], error=None)
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.users.supabase", mock_supabase):
        response = client.post("/api/users/", json=payload)

    assert response.status_code == 201
    assert response.json() == inserted
