from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from types import SimpleNamespace
from app.main import app

client = TestClient(app)


def test_chat_endpoint():
    mock_resp = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content="hello"))])
    with patch("app.routers.chat.openai.ChatCompletion.acreate", new=AsyncMock(return_value=mock_resp)), \
         patch("app.routers.chat.openai.api_key", "test-key"):
        response = client.post(
            "/api/chat/",
            content=b'{"message":"hi"}',
            headers={"Content-Type": "application/json"},
        )
    assert response.status_code == 200
    assert response.json() == {"answer": "hello"}
