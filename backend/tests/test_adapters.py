import pytest
from app.services.adapters.alpaca_adapter import AlpacaAdapter
from app.services.adapters.polygon_adapter import PolygonAdapter
from app.services.adapters.sec_edgar_adapter import SecEdgarAdapter
from app.services.adapters.news_adapter import FinancialNewsAdapter
from app.services.adapters.market_data_service import MarketDataService

@pytest.mark.asyncio
async def test_sec_edgar_13f_disclaimer():
    sec = SecEdgarAdapter()
    data = await sec.get_13f_institutional_data("NVDA")
    assert "ticker" in data
    assert data["ticker"] == "NVDA"
    assert "disclaimer" in data
    assert "delayed by up to 45 calendar days" in data["disclaimer"]
    assert data["is_realtime"] is False
    assert data["net_institutional_change_pct"] > 0

@pytest.mark.asyncio
async def test_news_adapter_prompt_injection_defense():
    news = FinancialNewsAdapter()
    articles = await news.fetch_news_for_ticker("NVDA", limit=2)
    assert len(articles) > 0
    for art in articles:
        assert art["is_sanitized"] is True
        assert "<HEADLINE_DATA_BOUNDARY>" in art["llm_safe_boundary"]

@pytest.mark.asyncio
async def test_market_data_service_analysis():
    service = MarketDataService()
    bars = [
        {"date": f"2026-01-{i:02d}", "open": 100.0 + i, "high": 105.0 + i, "low": 98.0 + i, "close": 102.0 + i, "volume": 1500000.0}
        for i in range(1, 25)
    ]
    res = await service.get_analyzed_stock_data("NVDA", bars, stock_currency="USD")
    assert res["data_quality_ok"] is True
    assert res["data_quality_score"] == 100.0
    assert "vwap" in res
    assert "rvol" in res
    assert "composite_smart_money_score" in res
    assert 10.0 <= res["composite_smart_money_score"] <= 95.0
