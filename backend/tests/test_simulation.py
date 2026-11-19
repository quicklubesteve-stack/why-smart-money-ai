import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.tier_service import tier_service

client = TestClient(app)

def test_monte_carlo_simulation_engine():
    # Set to PRO so 2000 simulations are allowed
    tier_service.set_current_tier("PRO")

    payload = {
        "ticker": "NVDA",
        "num_simulations": 2000,
        "horizon_days": 30,
        "target_price": 140.0,
        "stop_loss": 118.0,
        "include_smart_money_bias": True
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["ticker"] == "NVDA"
    assert data["num_simulations"] == 2000
    assert data["horizon_days"] == 30
    assert "current_price" in data
    assert "expected_terminal_price" in data
    assert "median_terminal_price" in data
    assert "prob_profit" in data
    assert 0.0 <= data["prob_profit"] <= 1.0
    assert "prob_target_hit" in data
    assert "prob_stop_hit" in data
    assert "var_95_price" in data
    assert "distribution_histogram" in data
    assert len(data["distribution_histogram"]) == 15
    assert "percentile_curves" in data
    assert "p5" in data["percentile_curves"]
    assert "p50" in data["percentile_curves"]
    assert "p95" in data["percentile_curves"]
    assert len(data["percentile_curves"]["p50"]) == 31  # Day 0 to Day 30
    assert "sample_paths" in data
    assert len(data["sample_paths"]) == 20
    assert data["tier_capped"] is False

def test_simulation_tier_enforcement_on_free():
    # Set tier to FREE
    tier_service.set_current_tier("FREE")

    payload = {
        "ticker": "NVDA",
        "num_simulations": 2000,  # exceeds Free cap (100)
        "horizon_days": 30,       # exceeds Free cap (20)
        "enforce_tier_limit": True
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Should be capped at Free limit (100)
    assert data["num_simulations"] == 100
    assert data["horizon_days"] == 20
    assert data["tier_capped"] is True
    assert "Upgrade to PRO" in data["tier_message"]
