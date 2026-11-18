import datetime
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
from app.config import settings
from app.services.adapters.alpaca_adapter import AlpacaAdapter
from app.services.adapters.polygon_adapter import PolygonAdapter
from app.services.adapters.sec_edgar_adapter import SecEdgarAdapter
from app.services.adapters.news_adapter import FinancialNewsAdapter
from app.services.data_quality import validate_ohlcv_bars, validate_quote_freshness, DataQualityValidationResult
from app.services.technical_indicators import (
    compute_vwap, compute_rvol, compute_accumulation_distribution,
    compute_obv, compute_atr, compute_rsi, detect_volume_price_divergence,
    calculate_composite_smart_money_score
)

class MarketDataService:
    """
    Unified market data service handling US & Canadian equities,
    technical indicator generation, and strict fail-closed data quality validation.
    """
    def __init__(self):
        self.alpaca = AlpacaAdapter()
        self.polygon = PolygonAdapter()
        self.sec = SecEdgarAdapter()
        self.news = FinancialNewsAdapter()

    async def get_analyzed_stock_data(
        self,
        ticker: str,
        stored_bars: List[Dict[str, Any]],
        stock_currency: str = "USD"
    ) -> Dict[str, Any]:
        """
        Analyzes a stock using the technical indicator engine and data quality validator.
        If data quality validation fails or data is stale, marks status as FAIL_CLOSED.
        """
        # 1. Step 1: Run Data Quality Validation on Bars
        quality_res: DataQualityValidationResult = validate_ohlcv_bars(stored_bars)
        
        if quality_res.should_abstain:
            return {
                "ticker": ticker,
                "data_quality_ok": False,
                "data_quality_score": quality_res.quality_score,
                "issues": quality_res.issues,
                "fail_closed_status": "ABSTAIN",
                "message": "Data quality validation failed. Trading signals suppressed under fail-closed security protocol."
            }

        # 2. Step 2: Convert to DataFrame for vectorized indicator calculations
        df = pd.DataFrame(stored_bars)
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date").reset_index(drop=True)

        vwap_series = compute_vwap(df)
        rvol_series = compute_rvol(df)
        ad_series = compute_accumulation_distribution(df)
        obv_series = compute_obv(df)
        atr_series = compute_atr(df)
        rsi_series = compute_rsi(df)
        
        divergence_type, divergence_expl = detect_volume_price_divergence(df)

        latest_close = float(df["close"].iloc[-1])
        latest_vwap = float(vwap_series.iloc[-1])
        latest_rvol = float(rvol_series.iloc[-1])
        latest_atr = float(atr_series.iloc[-1])
        latest_rsi = float(rsi_series.iloc[-1])
        vwap_ratio = round(latest_close / latest_vwap, 3)

        # 3. Step 3: Fetch institutional proxies
        off_exchange_ratio = await self.polygon.estimate_off_exchange_ratio(ticker)
        sec_13f_data = await self.sec.get_13f_institutional_data(ticker)

        # 4. Step 4: Calculate Confluence Smart Money Score
        composite_score = calculate_composite_smart_money_score(
            rvol=latest_rvol,
            vwap_ratio=vwap_ratio,
            ad_divergence=divergence_type,
            off_exchange_ratio=off_exchange_ratio,
            sec_13f_change_pct=sec_13f_data["net_institutional_change_pct"]
        )

        return {
            "ticker": ticker,
            "data_quality_ok": True,
            "data_quality_score": quality_res.quality_score,
            "issues": [],
            "current_price": latest_close,
            "vwap": latest_vwap,
            "vwap_ratio": vwap_ratio,
            "rvol": round(latest_rvol, 2),
            "atr_14": round(latest_atr, 2),
            "rsi_14": round(latest_rsi, 1),
            "divergence": divergence_type,
            "divergence_explanation": divergence_expl,
            "off_exchange_ratio": off_exchange_ratio,
            "sec_13f": sec_13f_data,
            "composite_smart_money_score": composite_score,
            "currency": stock_currency,
            "data_source": "LIVE_API" if self.alpaca.is_configured else "DEMO DATA (SYNTHETIC FEED)"
        }

market_data_service = MarketDataService()
