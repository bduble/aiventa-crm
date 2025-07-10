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


def test_cors_vercel_env(monkeypatch):
    # When VERCEL_URL is set the server should automatically allow that origin
    monkeypatch.setenv("VERCEL_URL", "preview.vercel.app")
    from importlib import reload
    import app.main as main
    reload(main)
    client = TestClient(main.app)

    resp = client.options(
        "/api/floor-traffic/",
        headers={
            "Origin": "https://preview.vercel.app",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "https://preview.vercel.app"


def test_cors_frontend_env(monkeypatch):
    """FRONTEND_URL should automatically be allowed."""
    monkeypatch.setenv("FRONTEND_URL", "https://myapp.example.com")
    from importlib import reload
    import app.main as main
    reload(main)
    client = TestClient(main.app)

    resp = client.get(
        "/api/floor-traffic/",
        headers={"Origin": "https://myapp.example.com"},
    )

    assert resp.status_code in (200, 404, 500)
    assert resp.headers.get("access-control-allow-origin") == "https://myapp.example.com"
