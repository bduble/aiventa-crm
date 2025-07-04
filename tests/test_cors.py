from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_cors_get():
    resp = client.get(
        "/api/floor-traffic/",
        headers={"Origin": "https://aiventa-crm.vercel.app"},
    )
    assert resp.status_code in (200, 404, 500)
    assert resp.headers.get("access-control-allow-origin") in ("https://aiventa-crm.vercel.app", "*")


def test_cors_inventory():
    from unittest.mock import MagicMock, patch

    mock_table = MagicMock()
    mock_table.select.return_value.execute.return_value = MagicMock(data=[], error=None)
    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch("app.routers.inventory.supabase", mock_supabase):
        resp = client.get(
            "/api/inventory/",
            headers={"Origin": "https://aiventa-crm.vercel.app"},
        )

    assert resp.status_code in (200, 404, 500)
    assert resp.headers.get("access-control-allow-origin") in ("https://aiventa-crm.vercel.app", "*")
