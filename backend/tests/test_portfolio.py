from fastapi.testclient import TestClient
from app.main import app

def test_paper_portfolio_and_trade():
    with TestClient(app) as client:
        # 1. Fetch current portfolio
        res = client.get("/api/portfolio")
        assert res.status_code == 200
        pdata = res.json()
        assert pdata["cash_balance"] > 0
        assert pdata["is_live_trading_enabled"] is False

        # 2. Reject unconfirmed order
        bad_req = {
            "ticker": "NVDA",
            "side": "BUY",
            "order_type": "LIMIT",
            "shares": 5.0,
            "confirm_paper_trading": False
        }
        res_bad = client.post("/api/portfolio/trade", json=bad_req)
        assert res_bad.status_code == 400

        # 3. Execute confirmed paper trade
        good_req = {
            "ticker": "NVDA",
            "side": "BUY",
            "order_type": "LIMIT",
            "shares": 5.0,
            "confirm_paper_trading": True
        }
        res_good = client.post("/api/portfolio/trade", json=good_req)
        assert res_good.status_code == 200
        order = res_good.json()
        assert order["ticker"] == "NVDA"
        assert order["status"] == "FILLED"
        assert order["executed_price"] > 0
        assert order["slippage_bps"] > 0
