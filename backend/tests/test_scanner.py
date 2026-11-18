from fastapi.testclient import TestClient
from app.main import app

def test_scanner_universe():
    with TestClient(app) as client:
        response = client.get("/api/scanner")
        assert response.status_code == 200
        stocks = response.json()
        assert len(stocks) >= 10
        
        tickers = [s["ticker"] for s in stocks]
        # Check both US and TSX tickers exist in universe
        assert "NVDA" in tickers
        assert "SHOP.TO" in tickers
        assert "RY.TO" in tickers

def test_scanner_filters():
    with TestClient(app) as client:
        # Filter TSX exchange
        res_tsx = client.get("/api/scanner?exchange=TSX")
        assert res_tsx.status_code == 200
        tsx_stocks = res_tsx.json()
        assert all(s["exchange"] == "TSX" and s["currency"] == "CAD" for s in tsx_stocks)

        # Filter NASDAQ exchange
        res_nasdaq = client.get("/api/scanner?exchange=NASDAQ")
        assert res_nasdaq.status_code == 200
        nasdaq_stocks = res_nasdaq.json()
        assert all(s["exchange"] == "NASDAQ" and s["currency"] == "USD" for s in nasdaq_stocks)

def test_stock_technical_analysis_endpoint():
    with TestClient(app) as client:
        res = client.get("/api/stocks/NVDA/technical-analysis")
        assert res.status_code == 200
        data = res.json()
        assert data["ticker"] == "NVDA"
        assert data["data_quality_ok"] is True
        assert data["data_quality_score"] == 100.0
        assert "vwap" in data
        assert "rvol" in data
        assert "atr_14" in data
        assert "rsi_14" in data
        assert "divergence" in data
        assert "composite_smart_money_score" in data
        assert "sec_13f" in data
        assert "disclaimer" in data["sec_13f"]

