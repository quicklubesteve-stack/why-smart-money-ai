import pytest
from app.services.data_quality import validate_ohlcv_bars, validate_quote_freshness
import datetime

def test_valid_ohlcv_bars():
    bars = [
        {"date": f"2026-01-{i:02d}", "open": 100.0, "high": 105.0, "low": 98.0, "close": 102.0, "volume": 1000000.0}
        for i in range(1, 15)
    ]
    res = validate_ohlcv_bars(bars)
    assert res.is_valid is True
    assert res.quality_score == 100.0
    assert res.should_abstain is False
    assert len(res.issues) == 0

def test_invalid_ohlcv_inverted_high_low():
    bars = [
        {"date": "2026-01-01", "open": 100.0, "high": 95.0, "low": 105.0, "close": 98.0, "volume": 1000000.0},
        {"date": "2026-01-02", "open": 100.0, "high": 105.0, "low": 98.0, "close": 102.0, "volume": 1000000.0},
        {"date": "2026-01-03", "open": 100.0, "high": 105.0, "low": 98.0, "close": 102.0, "volume": 1000000.0},
        {"date": "2026-01-04", "open": 100.0, "high": 105.0, "low": 98.0, "close": 102.0, "volume": 1000000.0},
        {"date": "2026-01-05", "open": 100.0, "high": 105.0, "low": 98.0, "close": 102.0, "volume": 1000000.0},
    ]
    res = validate_ohlcv_bars(bars)
    assert res.is_valid is False
    assert res.should_abstain is True
    assert any("High (95.0) cannot be lower than Low (105.0)" in issue for issue in res.issues)

def test_negative_price_detection():
    bars = [
        {"date": "2026-01-01", "open": -10.0, "high": 15.0, "low": -12.0, "close": 12.0, "volume": 1000000.0},
        {"date": "2026-01-02", "open": 10.0, "high": 15.0, "low": 8.0, "close": 12.0, "volume": 1000000.0},
        {"date": "2026-01-03", "open": 10.0, "high": 15.0, "low": 8.0, "close": 12.0, "volume": 1000000.0},
        {"date": "2026-01-04", "open": 10.0, "high": 15.0, "low": 8.0, "close": 12.0, "volume": 1000000.0},
        {"date": "2026-01-05", "open": 10.0, "high": 15.0, "low": 8.0, "close": 12.0, "volume": 1000000.0},
    ]
    res = validate_ohlcv_bars(bars)
    assert res.is_valid is False
    assert res.should_abstain is True

def test_quote_freshness_validator():
    recent = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
    is_fresh, msg = validate_quote_freshness(recent, max_stale_hours=24)
    assert is_fresh is True

    stale = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
    is_fresh_stale, msg_stale = validate_quote_freshness(stale, max_stale_hours=48)
    assert is_fresh_stale is False
    assert "stale" in msg_stale.lower()
