from unittest.mock import MagicMock, patch
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_global_search():
    cust_sample = [{"id": "1", "name": "Alice"}]
    inv_sample = [{"id": "2", "make": "Ford"}]

    cust_query = MagicMock()
    cust_query.or_.return_value.limit.return_value.execute.return_value = MagicMock(data=cust_sample, error=None)

    inv_query = MagicMock()
    inv_query.or_.return_value.limit.return_value.execute.return_value = MagicMock(data=inv_sample, error=None)

    def table_side(name):
        tbl = MagicMock()
        if name == "customers":
            tbl.select.return_value = cust_query
        elif name == "inventory_with_days_in_stock":
            tbl.select.return_value = inv_query
        return tbl

    mock_supabase = MagicMock()
    mock_supabase.table.side_effect = table_side

    with patch("app.routers.search.supabase", mock_supabase):
        res = client.get("/api/search?q=al")

    assert res.status_code == 200
    assert res.json() == {"customers": cust_sample, "inventory": inv_sample}
    cust_query.or_.assert_called()
    inv_query.or_.assert_called()

