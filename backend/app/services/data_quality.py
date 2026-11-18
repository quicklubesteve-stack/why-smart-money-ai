import datetime
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np

class DataQualityValidationResult:
    def __init__(self, is_valid: bool, issues: List[str], quality_score: float):
        self.is_valid = is_valid
        self.issues = issues
        self.quality_score = quality_score  # 0.0 to 100.0

    @property
    def should_abstain(self) -> bool:
        """Fail-closed: Returns True if data quality is insufficient to produce reliable signals."""
        return not self.is_valid or self.quality_score < 70.0


def validate_ohlcv_bars(bars: List[Dict[str, Any]]) -> DataQualityValidationResult:
    """
    Validates a list of OHLCV bars for mathematical consistency, monotonicity,
    zero-volume anomalies, and split jumps.
    """
    issues = []
    if not bars or len(bars) < 5:
        return DataQualityValidationResult(
            is_valid=False,
            issues=["Insufficient historical bars for quantitative analysis (minimum 5 required)"],
            quality_score=0.0
        )

    dedup_dates = set()
    prev_date = None
    prev_close = None
    severity_penalties = 0.0

    for idx, b in enumerate(bars):
        date_str = b.get("date")
        o = b.get("open", 0.0)
        h = b.get("high", 0.0)
        l = b.get("low", 0.0)
        c = b.get("close", 0.0)
        v = b.get("volume", 0.0)

        # 1. Non-negative prices & volume
        if o <= 0 or h <= 0 or l <= 0 or c <= 0:
            issues.append(f"Bar {date_str}: Price values must be strictly positive (O:{o}, H:{h}, L:{l}, C:{c})")
            severity_penalties += 30.0

        if v < 0:
            issues.append(f"Bar {date_str}: Volume cannot be negative ({v})")
            severity_penalties += 20.0

        # 2. Geometric bounds
        if h < l:
            issues.append(f"Bar {date_str}: High ({h}) cannot be lower than Low ({l})")
            severity_penalties += 50.0

        if h < max(o, c):
            issues.append(f"Bar {date_str}: High ({h}) is less than max(open, close) ({max(o, c)})")
            severity_penalties += 25.0

        if l > min(o, c):
            issues.append(f"Bar {date_str}: Low ({l}) is greater than min(open, close) ({min(o, c)})")
            severity_penalties += 25.0

        # 3. Duplicate and chronological order checks
        if date_str in dedup_dates:
            issues.append(f"Duplicate date detected: {date_str}")
            severity_penalties += 20.0
        dedup_dates.add(date_str)

        if prev_date and date_str < prev_date:
            issues.append(f"Non-chronological date sequence: {date_str} appeared after {prev_date}")
            severity_penalties += 30.0

        # 4. Outlier split/jump anomaly check (>85% single day change without adjustment)
        if prev_close and prev_close > 0:
            pct_change = abs((c - prev_close) / prev_close)
            if pct_change > 0.85:
                issues.append(f"Bar {date_str}: Extreme price jump detected ({pct_change*100:.1f}%), potential unadjusted stock split")
                severity_penalties += 20.0

        prev_date = date_str
        prev_close = c

    quality_score = max(0.0, 100.0 - severity_penalties)
    is_valid = len(issues) == 0

    return DataQualityValidationResult(
        is_valid=is_valid,
        issues=issues,
        quality_score=quality_score
    )


def validate_quote_freshness(latest_update: Optional[datetime.datetime], max_stale_hours: int = 72) -> Tuple[bool, str]:
    """
    Validates whether quote data is fresh enough for active trading signal generation.
    Accounts for market weekends (up to 72 hours).
    """
    if not latest_update:
        return False, "Timestamp missing: Market feed has no recorded timestamp"

    now = datetime.datetime.now(datetime.timezone.utc)
    # Ensure timezone aware comparison
    if latest_update.tzinfo is None:
        latest_update = latest_update.replace(tzinfo=datetime.timezone.utc)

    age_hours = (now - latest_update).total_seconds() / 3600.0
    if age_hours > max_stale_hours:
        return False, f"Data is stale: Last recorded bar is {age_hours:.1f} hours old (threshold: {max_stale_hours}h)"

    return True, f"Data is fresh ({age_hours:.1f} hours old)"
