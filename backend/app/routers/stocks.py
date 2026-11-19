from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.schema import Stock, DailyBar, AIPrediction, SmartMoneyMetric
from pydantic import BaseModel, ConfigDict
import datetime

router = APIRouter(prefix="/api/stocks", tags=["stocks"])

class BarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    vwap: Optional[float]

class StockDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticker: str
    name: str
    exchange: str
    currency: str
    sector: Optional[str]
    industry: Optional[str]
    market_cap: Optional[float]
    current_price: Optional[float]
    change_pct: float
    relative_volume: float
    volatility_30d: float
    spread_pct: float
    atr_14: Optional[float] = 2.5
    rsi_14: Optional[float] = 50.0
    data_quality_score: Optional[float] = 100.0
    data_quality_status: Optional[str] = "VERIFIED_OK"
    avg_volume_30d: Optional[float]
    is_liquid: bool
    latest_update: datetime.datetime
    data_source: str

class StockOverviewResponse(BaseModel):
    stock: StockDetailResponse
    volatility: Dict[str, Any]
    bars: List[BarResponse]
    prediction: Optional[Dict[str, Any]]
    smart_money: Optional[Dict[str, Any]]

@router.get("", response_model=List[StockDetailResponse])
@router.get("/search", response_model=List[StockDetailResponse])
def search_stocks(
    q: Optional[str] = Query(None, description="Search by full company name or ticker symbol"),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Stock).filter(Stock.is_active == True)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter((Stock.ticker.ilike(term)) | (Stock.name.ilike(term)))
    return query.order_by(Stock.relative_volume.desc()).limit(limit).all()

@router.get("/live/quotes")
def get_live_quotes(db: Session = Depends(get_db)):
    stocks = db.query(Stock).filter(Stock.is_active == True).order_by(Stock.relative_volume.desc()).all()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    return [
        {
            "ticker": s.ticker,
            "name": s.name,
            "exchange": s.exchange,
            "currency": s.currency,
            "current_price": s.current_price,
            "change_pct": s.change_pct,
            "relative_volume": s.relative_volume,
            "volatility_30d": s.volatility_30d,
            "updated_at": now_iso
        }
        for s in stocks
    ]

@router.get("/{ticker}/overview", response_model=StockOverviewResponse)
def get_stock_overview(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found in universe")

    # Bars history (last 60 trading bars)
    bars = (
        db.query(DailyBar)
        .filter(DailyBar.stock_id == stock.id)
        .order_by(DailyBar.date.asc())
        .limit(60)
        .all()
    )

    # Volatility metrics
    vol_pct = round(stock.volatility_30d * 100, 2)
    regime = "High" if vol_pct >= 40 else "Moderate" if vol_pct >= 20 else "Low"
    spread_bps = round(stock.spread_pct * 10000, 1)

    volatility_data = {
        "volatility_30d_pct": vol_pct,
        "annualized_volatility_pct": vol_pct,
        "atr_14": stock.atr_14 or 2.50,
        "relative_volume": stock.relative_volume,
        "spread_pct": stock.spread_pct,
        "spread_bps": spread_bps,
        "volatility_regime": regime,
        "explanation": f"Annualized 30-day historical volatility is {vol_pct}%, classified as {regime} volatility regime."
    }

    # Latest AI prediction
    pred = (
        db.query(AIPrediction)
        .filter(AIPrediction.stock_id == stock.id)
        .order_by(AIPrediction.generated_at.desc())
        .first()
    )
    prediction_data = None
    if pred:
        prediction_data = {
            "horizon": pred.horizon,
            "predicted_direction": pred.predicted_direction,
            "expected_return_pct": pred.expected_return_pct,
            "confidence_interval_low": pred.confidence_interval_low,
            "confidence_interval_high": pred.confidence_interval_high,
            "model_confidence": pred.model_confidence,
            "model_confidence_pct": round(pred.model_confidence * 100, 1),
            "uncertainty_level": pred.uncertainty_level,
            "is_abstained": pred.is_abstained,
            "top_factors": pred.top_factors or []
        }

    # Latest Smart Money Metric
    sm = (
        db.query(SmartMoneyMetric)
        .filter(SmartMoneyMetric.stock_id == stock.id)
        .order_by(SmartMoneyMetric.id.desc())
        .first()
    )
    smart_money_data = None
    if sm:
        smart_money_data = {
            "composite_score": sm.composite_score,
            "volume_price_divergence": sm.volume_price_divergence,
            "block_trade_count": sm.block_trade_count,
            "off_exchange_ratio": sm.off_exchange_ratio,
            "institutional_13f_change_pct": sm.institutional_13f_change_pct,
            "proxy_confidence": sm.proxy_confidence,
            "explanation": sm.explanation
        }

    return StockOverviewResponse(
        stock=StockDetailResponse.model_validate(stock),
        volatility=volatility_data,
        bars=[BarResponse.model_validate(b) for b in bars],
        prediction=prediction_data,
        smart_money=smart_money_data
    )

@router.get("/{ticker}", response_model=StockDetailResponse)
def get_stock(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found in universe")
    return stock

@router.get("/{ticker}/bars", response_model=List[BarResponse])
def get_stock_bars(ticker: str, limit: int = 90, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")
    
    bars = (
        db.query(DailyBar)
        .filter(DailyBar.stock_id == stock.id)
        .order_by(DailyBar.date.asc())
        .limit(limit)
        .all()
    )
    return bars

@router.get("/{ticker}/technical-analysis")
async def get_technical_analysis(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

    bars = (
        db.query(DailyBar)
        .filter(DailyBar.stock_id == stock.id)
        .order_by(DailyBar.date.asc())
        .limit(90)
        .all()
    )

    bars_dicts = [
        {
            "date": b.date,
            "open": b.open,
            "high": b.high,
            "low": b.low,
            "close": b.close,
            "volume": b.volume,
            "vwap": b.vwap
        }
        for b in bars
    ]

    from app.services.adapters.market_data_service import market_data_service
    analysis = await market_data_service.get_analyzed_stock_data(
        ticker=stock.ticker,
        stored_bars=bars_dicts,
        stock_currency=stock.currency
    )

    return analysis

