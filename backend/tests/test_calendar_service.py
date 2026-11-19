import pytest
import datetime
from app.services.calendar_service import calendar_service

def test_distinct_us_vs_canadian_holidays():
    # Victoria Day (May 18, 2026): TSX is CLOSED, US is OPEN
    victoria_day = datetime.date(2026, 5, 18)
    status_vic = calendar_service.get_market_status(victoria_day)
    assert status_vic["us_markets"]["is_trading_day"] is True
    assert status_vic["canadian_markets"]["is_trading_day"] is False
    assert "Victoria Day" in status_vic["canadian_markets"]["closure_reason"]

    # Juneteenth (June 19, 2026): US is CLOSED, TSX is OPEN
    juneteenth = datetime.date(2026, 6, 19)
    status_june = calendar_service.get_market_status(juneteenth)
    assert status_june["us_markets"]["is_trading_day"] is False
    assert status_june["canadian_markets"]["is_trading_day"] is True
    assert "Juneteenth" in status_june["us_markets"]["closure_reason"]

    # Canadian Thanksgiving (Oct 12, 2026): TSX CLOSED, US OPEN
    can_thanksgiving = datetime.date(2026, 10, 12)
    status_ct = calendar_service.get_market_status(can_thanksgiving)
    assert status_ct["us_markets"]["is_trading_day"] is True
    assert status_ct["canadian_markets"]["is_trading_day"] is False

    # US Thanksgiving (Nov 26, 2026): US CLOSED, TSX OPEN
    us_thanksgiving = datetime.date(2026, 11, 26)
    status_ut = calendar_service.get_market_status(us_thanksgiving)
    assert status_ut["us_markets"]["is_trading_day"] is False
    assert status_ut["canadian_markets"]["is_trading_day"] is True

def test_weekend_closures():
    saturday = datetime.date(2026, 1, 10)
    status = calendar_service.get_market_status(saturday)
    assert status["is_any_market_open"] is False
    assert status["us_markets"]["is_trading_day"] is False
    assert status["canadian_markets"]["is_trading_day"] is False
