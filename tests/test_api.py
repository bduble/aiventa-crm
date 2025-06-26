import os
import sys
import types
import importlib
from fastapi.testclient import TestClient
from types import SimpleNamespace
import pytest


# Ensure project root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


class MockQuery:
    def __init__(self, data):
        self._data = data

    def select(self, *args, **kwargs):
        return self

    def gte(self, *args, **kwargs):
        return self

    def lt(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def single(self):
        return self

    def execute(self):
        return SimpleNamespace(data=self._data, error=None)


class MockSupabase:
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return MockQuery(self.tables.get(name, []))


@pytest.fixture(scope="session")
def test_client():
    tables = {
        "floor_traffic_customers": [
            {
                "id": 1,
                "first_name": "Alice",
                "last_name": "Smith",
                "visit_time": "2023-01-01T12:00:00",
                "created_at": "2023-01-01T12:00:00",
            }
        ],
        "leads": [
            {"id": 1, "name": "Foo", "email": "foo@example.com"}
        ],
    }
    mock_client = MockSupabase(tables)
    # Inject fake app.db before importing the app
    mock_db = types.ModuleType("app.db")
    mock_db.supabase = mock_client
    sys.modules["app.db"] = mock_db
    import app.main
    importlib.reload(app.main)
    client = TestClient(app.main.app)
    return client


def test_floor_traffic_today(test_client):
    resp = test_client.get("/api/floor-traffic/today")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert data[0]["first_name"] == "Alice"


def test_list_leads(test_client):
    resp = test_client.get("/api/leads/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert data[0]["email"] == "foo@example.com"
