from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.schema import Stock, DailyBar
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

