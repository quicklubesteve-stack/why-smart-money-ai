from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "demo_mode" in data
        assert data["timezone"] == "America/Toronto"
