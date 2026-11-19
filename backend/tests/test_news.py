import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.news_service import news_service

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        news_service.seed_and_refresh_news(db)
    finally:
        db.close()

def test_get_recent_stock_news():
    response = client.get("/api/news")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8

    # Check required fields
    first = data[0]
    assert "ticker" in first
    assert "headline" in first
    assert "what_to_do_today" in first
    assert "volatility_score" in first
    assert 1 <= first["volatility_score"] <= 10
    assert "published_at" in first
    assert "05:00:00" in first["published_at"]
    assert first["publish_cycle"] == "5AM_DAILY_TORONTO"

def test_news_anthropic_ipo_coverage():
    response = client.get("/api/news?ticker=ANT")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    ant_art = data[0]
    assert ant_art["ticker"] == "ANT"
    assert "Anthropic" in ant_art["company_name"]
    assert ant_art["volatility_score"] == 9
    assert "BUY_ACCUMULATE" in ant_art["action_recommendation"]
    assert "TACTICAL ACTION FOR TODAY" in ant_art["what_to_do_today"]

def test_filter_news_by_category():
    response = client.get("/api/news?category=AI_TECH")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    for art in data:
        assert art["category"] == "AI_TECH"

def test_daily_action_playbook_at_5am():
    response = client.get("/api/news/daily-action")
    assert response.status_code == 200
    data = response.json()

    assert "5:00 AM America/Toronto" in data["title"]
    assert "05:00:00" in data["published_at"]
    assert "market_bias" in data
    assert "executive_action_summary" in data
    assert "TODAY'S TACTICAL DIRECTIVE" in data["executive_action_summary"]
    assert len(data["top_buys_today"]) >= 2
    assert len(data["volatility_warnings_today"]) >= 1

    # Verify audit hash
    assert "immutable_audit_fingerprint" in data
    assert len(data["immutable_audit_fingerprint"]) == 64
