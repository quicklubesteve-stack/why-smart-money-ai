from fastapi.testclient import TestClient
from app.main import app

def test_predictions_nvda():
    with TestClient(app) as client:
        response = client.get("/api/predictions/NVDA")
        assert response.status_code == 200
        preds = response.json()
        assert len(preds) > 0

        p = preds[0]
        assert p["ticker"] == "NVDA"
        assert p["predicted_direction"] in ["UP", "DOWN", "SIDEWAYS"]
        assert "confidence_interval_low" in p
        assert "confidence_interval_high" in p
        assert "top_factors" in p
