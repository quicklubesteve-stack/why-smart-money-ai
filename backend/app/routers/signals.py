from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.schema import Stock, TradingSignal
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/api/signals", tags=["signals"])

class SignalResponse(BaseModel):
    id: int
    ticker: str
    name: str
    exchange: str
    currency: str
    generated_at: datetime.datetime
    horizon: str
    recommendation: str
    quality_score: float
    calibrated_prob: float
    latest_quote: float
    entry_zone_min: float
    entry_zone_max: float
    target_price: float
    stop_loss: float
    risk_reward_ratio: float
    estimated_slippage_bps: int
    invalidation_rule: Optional[str]
    evidence_pro: List[str]
    evidence_con: List[str]
    status: str

@router.get("", response_model=List[SignalResponse])
def get_signals(
    recommendation: Optional[str] = Query(None, description="BUY, WATCH, HOLD, AVOID, SELL/EXIT"),
    min_quality_score: Optional[float] = Query(None, ge=0, le=100),
    db: Session = Depends(get_db)
):
    query = (
        db.query(TradingSignal, Stock)
        .join(Stock, TradingSignal.stock_id == Stock.id)
        .filter(TradingSignal.status == "ACTIVE")
    )

    if recommendation:
        query = query.filter(TradingSignal.recommendation == recommendation.upper())

    if min_quality_score:
        query = query.filter(TradingSignal.quality_score >= min_quality_score)

    results = query.order_by(TradingSignal.quality_score.desc()).all()

    output = []
    for sig, stock in results:
        output.append(
            SignalResponse(
                id=sig.id,
                ticker=stock.ticker,
                name=stock.name,
                exchange=stock.exchange,
                currency=stock.currency,
                generated_at=sig.generated_at,
                horizon=sig.horizon,
                recommendation=sig.recommendation,
                quality_score=sig.quality_score,
                calibrated_prob=sig.calibrated_prob,
                latest_quote=sig.latest_quote,
                entry_zone_min=sig.entry_zone_min,
                entry_zone_max=sig.entry_zone_max,
                target_price=sig.target_price,
                stop_loss=sig.stop_loss,
                risk_reward_ratio=sig.risk_reward_ratio,
                estimated_slippage_bps=sig.estimated_slippage_bps,
                invalidation_rule=sig.invalidation_rule,
                evidence_pro=sig.evidence_pro or [],
                evidence_con=sig.evidence_con or [],
                status=sig.status
            )
        )
    return output

@router.get("/{ticker}", response_model=SignalResponse)
def get_signal_by_ticker(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

    sig = (
        db.query(TradingSignal)
        .filter(TradingSignal.stock_id == stock.id, TradingSignal.status == "ACTIVE")
        .order_by(TradingSignal.id.desc())
        .first()
    )
    if not sig:
        raise HTTPException(status_code=404, detail=f"No active signal found for '{ticker}'")

    return SignalResponse(
        id=sig.id,
        ticker=stock.ticker,
        name=stock.name,
        exchange=stock.exchange,
        currency=stock.currency,
        generated_at=sig.generated_at,
        horizon=sig.horizon,
        recommendation=sig.recommendation,
        quality_score=sig.quality_score,
        calibrated_prob=sig.calibrated_prob,
        latest_quote=sig.latest_quote,
        entry_zone_min=sig.entry_zone_min,
        entry_zone_max=sig.entry_zone_max,
        target_price=sig.target_price,
        stop_loss=sig.stop_loss,
        risk_reward_ratio=sig.risk_reward_ratio,
        estimated_slippage_bps=sig.estimated_slippage_bps,
        invalidation_rule=sig.invalidation_rule,
        evidence_pro=sig.evidence_pro or [],
        evidence_con=sig.evidence_con or [],
        status=sig.status
    )
