import pytest
import pandas as pd
import numpy as np
from app.services.technical_indicators import (
    compute_vwap, compute_rvol, compute_accumulation_distribution,
    compute_obv, compute_atr, compute_rsi, detect_volume_price_divergence,
    calculate_composite_smart_money_score
)

@pytest.fixture
def sample_bars_df():
    data = {
        "date": pd.date_range(start="2026-01-01", periods=30, freq="D"),
        "open": [100.0 + i * 0.5 for i in range(30)],
        "high": [102.0 + i * 0.5 for i in range(30)],
        "low": [99.0 + i * 0.5 for i in range(30)],
        "close": [101.5 + i * 0.5 for i in range(30)],
        "volume": [1000000.0 + (i % 5) * 200000.0 for i in range(30)]
    }
    return pd.DataFrame(data)

def test_vwap_calculation(sample_bars_df):
    vwap = compute_vwap(sample_bars_df)
    assert len(vwap) == 30
    # VWAP should be between min low and max high
    assert vwap.iloc[-1] >= sample_bars_df["low"].min()
    assert vwap.iloc[-1] <= sample_bars_df["high"].max()

def test_rvol_calculation(sample_bars_df):
    rvol = compute_rvol(sample_bars_df, window=10)
    assert len(rvol) == 30
    assert (rvol > 0).all()

def test_accumulation_distribution(sample_bars_df):
    ad = compute_accumulation_distribution(sample_bars_df)
    assert len(ad) == 30
    assert not ad.isna().any()

def test_obv_calculation(sample_bars_df):
    obv = compute_obv(sample_bars_df)
    assert len(obv) == 30
    assert not obv.isna().any()

def test_atr_calculation(sample_bars_df):
    atr = compute_atr(sample_bars_df, period=14)
    assert len(atr) == 30
    assert (atr > 0).all()

def test_rsi_bounds(sample_bars_df):
    rsi = compute_rsi(sample_bars_df, period=14)
    assert len(rsi) == 30
    assert (rsi >= 0.0).all() and (rsi <= 100.0).all()

def test_divergence_detection(sample_bars_df):
    divergence, explanation = detect_volume_price_divergence(sample_bars_df)
    assert divergence in ["Bullish Accumulation", "Bullish Inflow", "Bearish Distribution", "Bearish Outflow", "Neutral"]
    assert len(explanation) > 0

def test_composite_smart_money_score():
    # Bullish high-conviction inputs
    score_high = calculate_composite_smart_money_score(
        rvol=2.6,
        vwap_ratio=1.03,
        ad_divergence="Bullish Accumulation",
        off_exchange_ratio=0.48,
        sec_13f_change_pct=3.5
    )
    assert 75.0 <= score_high <= 95.0

    # Bearish low-conviction inputs
    score_low = calculate_composite_smart_money_score(
        rvol=0.7,
        vwap_ratio=0.96,
        ad_divergence="Bearish Distribution",
        off_exchange_ratio=0.28,
        sec_13f_change_pct=-3.0
    )
    assert score_low < 45.0
