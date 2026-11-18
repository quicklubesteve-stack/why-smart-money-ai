import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional

def compute_vwap(df: pd.DataFrame) -> pd.Series:
    """
    Computes Volume-Weighted Average Price (VWAP) over available bars.
    VWAP = Cumulative(Typical Price * Volume) / Cumulative(Volume)
    Typical Price = (High + Low + Close) / 3
    """
    typical_price = (df["high"] + df["low"] + df["close"]) / 3.0
    cum_pv = (typical_price * df["volume"]).cumsum()
    cum_vol = df["volume"].cumsum()
    vwap = cum_pv / cum_vol.replace(0, np.nan)
    return vwap.bfill().ffill()

def compute_rvol(df: pd.DataFrame, window: int = 20) -> pd.Series:
    """
    Computes Relative Volume (RVOL) = current volume / rolling average volume of past N bars.
    Values > 1.5 indicate significant institutional activity.
    """
    rolling_avg = df["volume"].rolling(window=window, min_periods=3).mean()
    rvol = df["volume"] / rolling_avg.replace(0, np.nan)
    return rvol.fillna(1.0)

def compute_accumulation_distribution(df: pd.DataFrame) -> pd.Series:
    """
    Computes the Accumulation/Distribution (A/D) line.
    CLV = ((Close - Low) - (High - Close)) / (High - Low)
    A/D = Cumulative(CLV * Volume)
    """
    high_low_diff = df["high"] - df["low"]
    # Handle zero range bars (high == low)
    clv = np.where(
        high_low_diff > 0,
        ((df["close"] - df["low"]) - (df["high"] - df["close"])) / high_low_diff,
        0.0
    )
    ad_line = (clv * df["volume"]).cumsum()
    return pd.Series(ad_line, index=df.index)

def compute_obv(df: pd.DataFrame) -> pd.Series:
    """
    Computes On-Balance Volume (OBV).
    """
    close_diff = df["close"].diff()
    direction = np.where(close_diff > 0, 1, np.where(close_diff < 0, -1, 0))
    direction[0] = 0
    obv = (direction * df["volume"]).cumsum()
    return pd.Series(obv, index=df.index)

def compute_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Computes Average True Range (ATR) for volatility and stop-loss placement.
    """
    prev_close = df["close"].shift(1)
    tr1 = df["high"] - df["low"]
    tr2 = (df["high"] - prev_close).abs()
    tr3 = (df["low"] - prev_close).abs()
    true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = true_range.rolling(window=period, min_periods=1).mean()
    return atr

def compute_rsi(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Computes Relative Strength Index (RSI).
    """
    delta = df["close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    
    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()
    
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi.fillna(50.0)

def detect_volume_price_divergence(df: pd.DataFrame, lookback: int = 10) -> Tuple[str, str]:
    """
    Detects institutional accumulation or distribution divergences between price and volume/AD.
    Returns: (divergence_type, explanation)
    """
    if len(df) < lookback:
        return "Neutral", "Insufficient historical bars to determine volume-price divergence."

    recent = df.tail(lookback).copy()
    price_change_pct = (recent["close"].iloc[-1] - recent["close"].iloc[0]) / recent["close"].iloc[0] * 100
    
    # Compute A/D slope
    ad_series = compute_accumulation_distribution(recent)
    ad_change = ad_series.iloc[-1] - ad_series.iloc[0]

    # Compute average RVOL in recent period
    rvol_series = compute_rvol(df).tail(lookback)
    avg_rvol = rvol_series.mean()

    # Bullish Accumulation: Price is consolidating or down, but A/D is sharply positive with strong RVOL
    if price_change_pct >= -2.0 and price_change_pct <= 3.0 and ad_change > 0 and avg_rvol > 1.25:
        return "Bullish Accumulation", f"Price consolidating ({price_change_pct:+.1f}%) while Accumulation/Distribution line rose with {avg_rvol:.2f}x RVOL."
    
    # Strong Bullish Continuation
    if price_change_pct > 3.0 and ad_change > 0 and avg_rvol > 1.4:
        return "Bullish Inflow", f"Positive price momentum ({price_change_pct:+.1f}%) confirmed by rising institutional volume flow ({avg_rvol:.2f}x RVOL)."

    # Bearish Distribution: Price making new highs or flat, but A/D declining with elevated volume
    if price_change_pct >= 0.0 and ad_change < 0 and avg_rvol > 1.3:
        return "Bearish Distribution", f"Price up ({price_change_pct:+.1f}%) but Accumulation/Distribution is divergent with heavy selling pressure."

    if price_change_pct < -3.0 and avg_rvol > 1.4:
        return "Bearish Outflow", f"Heavy selling volume ({avg_rvol:.2f}x RVOL) accompanying price drop ({price_change_pct:+.1f}%)."

    return "Neutral", f"Balanced institutional flow with {avg_rvol:.2f}x relative volume."

def calculate_composite_smart_money_score(
    rvol: float,
    vwap_ratio: float,
    ad_divergence: str,
    off_exchange_ratio: float,
    sec_13f_change_pct: float
) -> float:
    """
    Calculates a standardized 0-100 composite Smart Money Score based on multi-factor confluence:
    - RVOL contribution: up to 25 pts
    - VWAP positioning: up to 25 pts
    - Divergence signal: up to 25 pts
    - Off-exchange / dark-pool proxy: up to 15 pts
    - 13F institutional ownership trend: up to 10 pts
    """
    score = 50.0  # Base neutral

    # 1. RVOL factor
    if rvol >= 2.5:
        score += 15.0
    elif rvol >= 1.5:
        score += 8.0
    elif rvol < 0.8:
        score -= 5.0

    # 2. VWAP factor (price above VWAP = institutional support)
    if vwap_ratio >= 1.02:
        score += 12.0
    elif vwap_ratio >= 1.0:
        score += 6.0
    elif vwap_ratio < 0.98:
        score -= 10.0

    # 3. Divergence factor
    if "Bullish Accumulation" in ad_divergence:
        score += 15.0
    elif "Bullish Inflow" in ad_divergence:
        score += 10.0
    elif "Bearish Distribution" in ad_divergence:
        score -= 15.0
    elif "Bearish Outflow" in ad_divergence:
        score -= 12.0

    # 4. Off-exchange ratio proxy (typically 35-50% in liquid US equities; spikes >45% denote block interest)
    if off_exchange_ratio >= 0.45:
        score += 5.0
    elif off_exchange_ratio < 0.30:
        score -= 2.0

    # 5. SEC 13F quarterly change
    if sec_13f_change_pct > 2.0:
        score += 5.0
    elif sec_13f_change_pct < -2.0:
        score -= 5.0

    # Bound strictly between 10.0 and 95.0 (preserve 95% aspirational principle)
    return round(float(np.clip(score, 10.0, 94.5)), 1)
