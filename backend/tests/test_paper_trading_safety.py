import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_paper_trading_risk_guardrails_and_close():
    # Fetch current portfolio state
    res_port = client.get("/api/portfolio")
    assert res_port.status_code == 200
    port_data = res_port.json()
    assert port_data["is_live_trading_enabled"] is False

    # Attempt trade without confirmation -> Should fail
    res_unconf = client.post("/api/portfolio/trade", json={
        "ticker": "NVDA",
        "side": "BUY",
        "shares": 10,
        "confirm_paper_trading": False
    })
    assert res_unconf.status_code == 400

    # Attempt order exceeding 25% single-position allocation guardrail -> Should fail
    res_huge = client.post("/api/portfolio/trade", json={
        "ticker": "NVDA",
        "side": "BUY",
        "shares": 10000,  # ~1.28M USD >> portfolio
        "confirm_paper_trading": True
    })
    assert res_huge.status_code == 400

    # Execute valid paper buy order with slippage & fee
    res_buy = client.post("/api/portfolio/trade", json={
        "ticker": "NVDA",
        "side": "BUY",
        "shares": 5,
        "confirm_paper_trading": True
    })
    assert res_buy.status_code == 200
    buy_data = res_buy.json()
    assert buy_data["status"] == "FILLED"
    assert buy_data["slippage_bps"] > 0
    assert buy_data["fee_paid"] == 1.00

    # Close position via /close-position endpoint
    res_close = client.post("/api/portfolio/close-position", json={
        "ticker": "NVDA",
        "confirm_paper_trading": True
    })
    assert res_close.status_code == 200
    close_data = res_close.json()
    assert close_data["status"] == "FILLED"
    assert close_data["side"] == "SELL"
    assert "Position closed at market" in close_data["notes"]
