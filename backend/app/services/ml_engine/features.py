import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any
from app.services.technical_indicators import (
    compute_vwap, compute_rvol, compute_accumulation_distribution,
    compute_atr, compute_rsi
)

FEATURE_COLUMNS = [
    "ret_1d",
    "ret_3d",
    "ret_5d",
    "ret_10d",
    "rvol_5d",
    "rvol_20d",
    "vwap_distance",
    "rsi_14",
    "atr_ratio",
    "ad_momentum",
    "volatility_20d"
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Constructs time-series features strictly utilizing historical information
    up to bar t (strictly preventing look-ahead bias and data leakage).
    """
    df = df.copy()
    if not isinstance(df.index, pd.DatetimeIndex) and "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date").reset_index(drop=True)

    # 1. Lagged Log Returns
    close = df["close"]
    df["ret_1d"] = np.log(close / close.shift(1)).fillna(0.0)
    df["ret_3d"] = np.log(close / close.shift(3)).fillna(0.0)
    df["ret_5d"] = np.log(close / close.shift(5)).fillna(0.0)
    df["ret_10d"] = np.log(close / close.shift(10)).fillna(0.0)

    # 2. Relative Volume
    df["rvol_5d"] = compute_rvol(df, window=5)
    df["rvol_20d"] = compute_rvol(df, window=20)

    # 3. VWAP Distance
    vwap = compute_vwap(df)
    df["vwap_distance"] = ((close - vwap) / vwap).fillna(0.0)

    # 4. Momentum & Oscillators
    df["rsi_14"] = compute_rsi(df, period=14) / 100.0  # Normalized 0-1

    # 5. Volatility & ATR Ratio
    atr = compute_atr(df, period=14)
    df["atr_ratio"] = (atr / close).fillna(0.02)
    df["volatility_20d"] = df["ret_1d"].rolling(window=20, min_periods=5).std().fillna(0.015)

    # 6. Accumulation/Distribution Momentum
    ad = compute_accumulation_distribution(df)
    df["ad_momentum"] = ((ad - ad.shift(5)) / (df["volume"].rolling(20, min_periods=5).sum() + 1e-6)).fillna(0.0)

    return df

def generate_forecast_targets(df: pd.DataFrame, horizon_days: int = 5) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    """
    Constructs forward returns starting strictly at t+1 up to t+horizon_days.
    Returns:
      X: Feature matrix
      y_direction: Binary label (1 if forward return > 0.0 else 0)
      y_return: Continuous future percentage return
    """
    features_df = engineer_features(df)

    # Future return strictly shifted backwards to align target at time t with outcome at t + horizon_days
    future_close = features_df["close"].shift(-horizon_days)
    forward_return_pct = ((future_close - features_df["close"]) / features_df["close"]) * 100.0

    # Binary classification target (UP vs DOWN)
    direction_target = (forward_return_pct > 0.0).astype(int)

    # Drop the last horizon_days rows where future outcome is unobserved
    valid_mask = forward_return_pct.notna()

    X = features_df.loc[valid_mask, FEATURE_COLUMNS].copy()
    y_dir = direction_target.loc[valid_mask].copy()
    y_ret = forward_return_pct.loc[valid_mask].copy()

    return X, y_dir, y_ret
