from fastapi.testclient import TestClient
from app.main import app

def test_signals_payload_quality():
    with TestClient(app) as client:
        response = client.get("/api/signals")
        assert response.status_code == 200
        signals = response.json()
        assert len(signals) > 0

        first = signals[0]
        # Verify required signal components
        assert "ticker" in first
        assert "recommendation" in first
        assert first["recommendation"] in ["BUY", "WATCH", "HOLD", "AVOID", "SELL/EXIT"]
        assert 0.0 <= first["quality_score"] <= 100.0
        assert 0.0 <= first["calibrated_prob"] <= 1.0
        assert first["entry_zone_min"] > 0
        assert first["entry_zone_max"] >= first["entry_zone_min"]
        assert first["target_price"] > 0
        assert first["stop_loss"] > 0
        assert first["risk_reward_ratio"] > 0
        assert first["estimated_slippage_bps"] >= 0
        assert len(first["evidence_pro"]) > 0
