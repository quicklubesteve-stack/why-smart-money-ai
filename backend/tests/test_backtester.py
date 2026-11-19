import pytest
import pandas as pd
from app.services.ml_engine.backtester import quantitative_backtester
from fastapi.testclient import TestClient
from app.main import app

def test_quantitative_backtester_simulation():
    dates = pd.date_range("2026-01-01", periods=45, freq="D").strftime("%Y-%m-%d")
    bars = [
        {
            "date": dates[i],
            "open": 100.0 + i * 0.4,
            "high": 103.0 + i * 0.4,
            "low": 98.0 + i * 0.4,
            "close": 101.0 + i * 0.4,
            "volume": 1500000.0,
            "vwap": 100.5 + i * 0.4
        }
        for i in range(45)
    ]

    res = quantitative_backtester.run_backtest(
        bars=bars,
        horizon_days=5,
        target_profit_pct=5.0,
        stop_loss_pct=3.0
    )

    assert "sample_count" in res
    assert res["sample_count"] > 0
    assert 0.0 <= res["win_rate"] <= 1.0
    assert 0.0 <= res["directional_accuracy"] <= 1.0
    assert res["sharpe_ratio"] >= 0.0
    assert res["max_drawdown"] <= 0.0
    assert "brier_score" in res
    assert len(res["trades"]) > 0

def test_dynamic_backtest_endpoint():
    with TestClient(app) as client:
        req = {
            "ticker": "NVDA",
            "horizon_days": 5,
            "target_profit_pct": 6.0,
            "stop_loss_pct": 3.0
        }
        res = client.post("/api/performance/run-backtest", json=req)
        assert res.status_code == 200
        data = res.json()
        assert data["ticker"] == "NVDA"
        assert "win_rate" in data
        assert "sharpe_ratio" in data
        assert "aspirational_target" in data
