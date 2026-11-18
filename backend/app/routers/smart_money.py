from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.schema import Stock, SmartMoneyMetric
from pydantic import BaseModel

router = APIRouter(prefix="/api/smart-money", tags=["smart-money"])

class SmartMoneyResponse(BaseModel):
    ticker: str
    name: str
    exchange: str
    currency: str
    as_of_date: str
    rel_volume: float
    vwap_ratio: float
    accumulation_distribution: float
    on_balance_volume: float
    volume_price_divergence: str
    block_trade_count: int
    off_exchange_ratio: float
    institutional_13f_change_pct: float
    composite_score: float
    proxy_confidence: str
    explanation: Optional[str]
    disclaimer: str

@router.get("/{ticker}", response_model=SmartMoneyResponse)
def get_smart_money_analysis(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

    metric = (
        db.query(SmartMoneyMetric)
        .filter(SmartMoneyMetric.stock_id == stock.id)
        .order_by(SmartMoneyMetric.id.desc())
        .first()
    )

    if not metric:
        raise HTTPException(status_code=404, detail=f"No smart money metrics found for '{ticker}'")

    return SmartMoneyResponse(
        ticker=stock.ticker,
        name=stock.name,
        exchange=stock.exchange,
        currency=stock.currency,
        as_of_date=metric.as_of_date,
        rel_volume=metric.rel_volume,
        vwap_ratio=metric.vwap_ratio,
        accumulation_distribution=metric.accumulation_distribution,
        on_balance_volume=metric.on_balance_volume,
        volume_price_divergence=metric.volume_price_divergence,
        block_trade_count=metric.block_trade_count,
        off_exchange_ratio=metric.off_exchange_ratio,
        institutional_13f_change_pct=metric.institutional_13f_change_pct,
        composite_score=metric.composite_score,
        proxy_confidence=metric.proxy_confidence,
        explanation=metric.explanation,
        disclaimer=metric.disclaimer
    )
