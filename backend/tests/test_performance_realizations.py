import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_performance_endpoint_rigor():
    response = client.get("/api/performance")
    assert response.status_code == 200
    data = response.json()

    # Core aspirational target vs measured win rate
    assert data["aspirational_win_rate_target"] == 0.95
    assert 0.50 <= data["measured_win_rate"] <= 0.85
    assert 0.55 <= data["directional_accuracy"] <= 0.85

    # Statistical rigor metrics
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert data["precision"] > 0.50
    assert data["recall"] > 0.50
    assert data["sharpe_ratio"] > 1.0
    assert data["max_drawdown_pct"] < 0.0

    # Multi-environment breakdown
    assert "environments" in data
    env_names = [e["environment"] for e in data["environments"]]
    assert any("Backtesting" in name for name in env_names)
    assert any("Paper Trading" in name for name in env_names)
    assert any("Live" in name for name in env_names)

    # Live trading must be locked out
    live_env = next(e for e in data["environments"] if "Live" in e["environment"])
    assert live_env["status"] == "LOCKED_BY_SAFETY_POLICY"
    assert live_env["sample_count"] == 0

    # Realized predictions audit log
    assert "realized_predictions_log" in data
    assert len(data["realized_predictions_log"]) > 0
    sample = data["realized_predictions_log"][0]
    assert "ticker" in sample
    assert "forecast_timestamp" in sample
    assert "realized_timestamp" in sample
    assert "predicted_direction" in sample
    assert "directional_hit" in sample
    assert "brier_score_component" in sample

    # Check forecast horizons
    assert len(data["horizons"]) >= 4
    horizons = [h["horizon"] for h in data["horizons"]]
    assert any("Intraday" in h for h in horizons)
    assert any("1D" in h for h in horizons)
    assert any("5 Days" in h for h in horizons)
    assert any("20 Days" in h for h in horizons)
