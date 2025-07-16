from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from types import SimpleNamespace
from app.main import app

client = TestClient(app)


def test_chat_endpoint():
    mock_resp = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content="hello"))])
    mock_client = SimpleNamespace(
        responses=SimpleNamespace(create=AsyncMock(return_value=mock_resp))
    )
    with (
        patch("app.routers.chat.get_openai_client", return_value=mock_client),
        patch("app.routers.chat.get_openai_prompt", return_value={"id": "1", "version": "v"})
    ):
        response = client.post(
            "/api/chat/",
            content=b'{"message":"hi"}',
            headers={"Content-Type": "application/json"},
        )
    assert response.status_code == 200
    assert response.json() == {"answer": "hello"}
