import pytest
from app.services.notifications.telegram_dispatcher import telegram_dispatcher

@pytest.mark.asyncio
async def test_telegram_dispatcher_deduplication():
    test_msg = "🚨 TEST ALERT: NVDA Relative Volume Spike at 3.1x RVOL."

    # First send should succeed (or simulate)
    res1 = await telegram_dispatcher.send_message(test_msg, deduplicate=True)
    assert res1["delivered"] is True
    assert res1["status"] in ["SENT", "SIMULATED_DISPATCH"]

    # Second send with identical text must be deduplicated
    res2 = await telegram_dispatcher.send_message(test_msg, deduplicate=True)
    assert res2["delivered"] is False
    assert res2["status"] == "DEDUPLICATED"

@pytest.mark.asyncio
async def test_telegram_message_formatting():
    mock_brief = {
        "brief_date": "2026-11-20",
        "session_type": "5AM_PREMARKET",
        "macro_summary": "Premarket index futures trade higher following benign wholesale inflation print.",
        "top_10_opportunities": [
            {"ticker": "NVDA", "exchange": "NASDAQ", "signal": "BUY", "score": 88.5},
            {"ticker": "SHOP.TO", "exchange": "TSX", "signal": "BUY", "score": 83.2}
        ],
        "immutable_hash": "e69b5256d90529c5a7983d4e2d160c121e45bbe64fa804605e5d01eb70090396"
    }

    formatted = telegram_dispatcher.format_morning_brief_alert(mock_brief)
    assert "WHY SMART MONEY AI" in formatted
    assert "NVDA" in formatted
    assert "SHOP.TO" in formatted
    assert "95% is an aspirational research target" in formatted
