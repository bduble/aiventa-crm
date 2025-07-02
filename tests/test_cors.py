from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_cors_get():
    resp = client.get(
        "/api/floor-traffic/",
        headers={"Origin": "https://aiventa-crm.vercel.app"},
    )
    assert resp.status_code in (200, 404, 500)
    assert resp.headers.get("access-control-allow-origin") == "https://aiventa-crm.vercel.app"
