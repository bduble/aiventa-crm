from fastapi.testclient import TestClient
from types import SimpleNamespace
from unittest.mock import patch
from app.main import app

client = TestClient(app)


def test_month_summary_no_openai():
    ft_metrics = {"total_customers": 5}
    lead_metrics = {"total_leads": 2}
    with patch("app.routers.analytics.floor_traffic.month_metrics", return_value=ft_metrics), \
         patch("app.routers.analytics.leads.month_metrics", return_value=lead_metrics), \
         patch("app.routers.analytics.get_openai_client", return_value=None):
        response = client.get("/api/analytics/month-summary")

    assert response.status_code == 200
    assert response.json() == {"summary": "OpenAI API key not configured"}
