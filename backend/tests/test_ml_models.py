import pytest
import pandas as pd
from app.services.ml_engine.model_trainer import ai_predictive_engine

def test_ml_model_train_and_forecast():
    # 40 synthetic daily bars
    dates = pd.date_range("2026-01-01", periods=35, freq="D").strftime("%Y-%m-%d")
    bars = [
        {
            "date": dates[i],
            "open": 100.0 + (i % 7) * 1.2 - (i % 4) * 0.8,
            "high": 104.0 + (i % 7) * 1.2,
            "low": 97.0 - (i % 4) * 0.8,
            "close": 101.5 + (i % 7) * 1.0 - (i % 5) * 1.1,
            "volume": 2000000.0 + (i % 3) * 500000.0,
            "vwap": 101.0 + (i % 7) * 0.5
        }
        for i in range(35)
    ]

    forecast = ai_predictive_engine.train_and_forecast(
        ticker="NVDA",
        bars=bars,
        horizon="5D"
    )

    assert forecast["ticker"] == "NVDA"
    assert forecast["horizon"] == "5D"
    assert forecast["predicted_direction"] in ["UP", "DOWN", "SIDEWAYS"]
    assert 0.0 <= forecast["model_confidence"] <= 1.0
    assert forecast["confidence_interval_low"] <= forecast["confidence_interval_high"]
    assert len(forecast["top_factors"]) > 0

def test_ml_model_insufficient_data_abstention():
    short_bars = [
        {"date": "2026-01-01", "open": 100.0, "high": 105.0, "low": 98.0, "close": 102.0, "volume": 1000000.0}
    ]
    forecast = ai_predictive_engine.train_and_forecast("NVDA", short_bars, horizon="5D")
    assert forecast["is_abstained"] is True
    assert "Insufficient" in forecast["abstain_reason"]
