from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_ingest_signal():
    mock_session = MagicMock()

    with patch("app.db.SessionLocal", return_value=mock_session):
        payload = {"type": "web_visit", "value": 1.0, "metadata": {"page": "/"}}
        cid = "11111111-1111-1111-1111-111111111111"
        response = client.post(f"/api/customers/{cid}/signals", json=payload)

    assert response.status_code == 201
    assert response.json() == {"status": "ok"}
    mock_session.add.assert_called()
    mock_session.commit.assert_called()


def test_get_ai_hotness():
    mock_session = MagicMock()
    signals = [SimpleNamespace(signal_type="web_visit", total_value=5)]
    mock_session.execute.return_value.all.return_value = signals
    mock_session.merge.return_value = None

    with patch("app.db.SessionLocal", return_value=mock_session):
        cid = "11111111-1111-1111-1111-111111111111"
        response = client.get(f"/api/customers/{cid}/ai-hotness")

    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == cid
    assert data["score"] == 0.5
    assert data["breakdown"][0]["signal_type"] == "web_visit"
    assert data["breakdown"][0]["contribution"] == 0.5
