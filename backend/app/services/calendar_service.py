import datetime
from typing import Dict, Any, Tuple, Optional
import pytz

# Exchange Trading Holidays (YYYY-MM-DD)
# Evaluates US (NYSE, NASDAQ) and Canadian (TSX) trading holidays independently.

US_HOLIDAYS = {
    # 2026
    "2026-01-01": "New Year's Day",
    "2026-01-19": "Martin Luther King Jr. Day",
    "2026-02-16": "Presidents' Day (Washington's Birthday)",
    "2026-04-03": "Good Friday",
    "2026-05-25": "Memorial Day",
    "2026-06-19": "Juneteenth National Independence Day",
    "2026-07-03": "Independence Day (Observed)",
    "2026-09-07": "Labor Day",
    "2026-11-26": "Thanksgiving Day (US)",
    "2026-12-25": "Christmas Day",
    # 2027
    "2027-01-01": "New Year's Day",
    "2027-01-18": "Martin Luther King Jr. Day",
    "2027-02-15": "Presidents' Day",
    "2027-03-26": "Good Friday",
    "2027-05-31": "Memorial Day",
    "2027-06-18": "Juneteenth (Observed)",
    "2027-07-05": "Independence Day (Observed)",
    "2027-09-06": "Labor Day",
    "2027-11-25": "Thanksgiving Day (US)",
    "2027-12-24": "Christmas Day (Observed)"
}

TSX_HOLIDAYS = {
    # 2026
    "2026-01-01": "New Year's Day",
    "2026-02-16": "Family Day (Canada)",
    "2026-04-03": "Good Friday",
    "2026-05-18": "Victoria Day (Canada)",
    "2026-07-01": "Canada Day",
    "2026-08-03": "Civic Holiday (Canada)",
    "2026-09-07": "Labour Day",
    "2026-10-12": "Thanksgiving Day (Canada)",
    "2026-12-25": "Christmas Day",
    "2026-12-28": "Boxing Day (Observed)",
    # 2027
    "2027-01-01": "New Year's Day",
    "2027-02-15": "Family Day (Canada)",
    "2027-03-26": "Good Friday",
    "2027-05-24": "Victoria Day (Canada)",
    "2027-07-01": "Canada Day",
    "2027-08-02": "Civic Holiday (Canada)",
    "2027-09-06": "Labour Day",
    "2027-10-11": "Thanksgiving Day (Canada)",
    "2027-12-27": "Christmas Day (Observed)",
    "2027-12-28": "Boxing Day (Observed)"
}

class ExchangeCalendarService:
    """
    Evaluates independent market schedules and holiday closures
    for US (NYSE, NASDAQ) and Canadian (TSX) equities in America/Toronto time.
    """
    TIMEZONE = "America/Toronto"

    @classmethod
    def get_toronto_now(cls) -> datetime.datetime:
        tz = pytz.timezone(cls.TIMEZONE)
        return datetime.datetime.now(tz)

    @classmethod
    def is_weekend(cls, dt: datetime.date) -> bool:
        return dt.weekday() >= 5  # Saturday = 5, Sunday = 6

    @classmethod
    def is_us_market_open_day(cls, dt: datetime.date) -> Tuple[bool, Optional[str]]:
        """Returns (is_open, holiday_name_if_closed)"""
        if cls.is_weekend(dt):
            return False, "Weekend (Saturday/Sunday)"
        date_str = dt.strftime("%Y-%m-%d")
        if date_str in US_HOLIDAYS:
            return False, US_HOLIDAYS[date_str]
        return True, None

    @classmethod
    def is_tsx_market_open_day(cls, dt: datetime.date) -> Tuple[bool, Optional[str]]:
        """Returns (is_open, holiday_name_if_closed)"""
        if cls.is_weekend(dt):
            return False, "Weekend (Saturday/Sunday)"
        date_str = dt.strftime("%Y-%m-%d")
        if date_str in TSX_HOLIDAYS:
            return False, TSX_HOLIDAYS[date_str]
        return True, None

    @classmethod
    def get_market_status(cls, dt: Optional[datetime.date] = None) -> Dict[str, Any]:
        """
        Evaluates both US and TSX exchanges for a given calendar date.
        """
        if dt is None:
            dt = cls.get_toronto_now().date()

        us_open, us_reason = cls.is_us_market_open_day(dt)
        tsx_open, tsx_reason = cls.is_tsx_market_open_day(dt)

        return {
            "date": dt.strftime("%Y-%m-%d"),
            "timezone": cls.TIMEZONE,
            "is_any_market_open": us_open or tsx_open,
            "us_markets": {
                "exchange": "NYSE / NASDAQ",
                "is_trading_day": us_open,
                "closure_reason": us_reason,
                "currency": "USD"
            },
            "canadian_markets": {
                "exchange": "TSX (Toronto Stock Exchange)",
                "is_trading_day": tsx_open,
                "closure_reason": tsx_reason,
                "currency": "CAD"
            }
        }

calendar_service = ExchangeCalendarService()
