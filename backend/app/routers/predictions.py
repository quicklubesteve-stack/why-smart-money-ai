from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models.schema import Stock, AIPrediction
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

class PredictionResponse(BaseModel):
    ticker: str
    name: str
    exchange: str
    currency: str
    generated_at: datetime.datetime
    horizon: str
    predicted_direction: str
    expected_return_pct: float
    confidence_interval_low: float
    confidence_interval_high: float
    model_confidence: float
    uncertainty_level: str
    is_abstained: bool
    abstain_reason: Optional[str]
    top_factors: List[Dict[str, Any]]

@router.get("/{ticker}", response_model=List[PredictionResponse])
def get_stock_predictions(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

    predictions = (
        db.query(AIPrediction)
        .filter(AIPrediction.stock_id == stock.id)
        .order_by(AIPrediction.generated_at.desc())
        .all()
    )

    if not predictions:
        raise HTTPException(status_code=404, detail=f"No predictions found for '{ticker}'")

    return [
        PredictionResponse(
            ticker=stock.ticker,
            name=stock.name,
            exchange=stock.exchange,
            currency=stock.currency,
            generated_at=p.generated_at,
            horizon=p.horizon,
            predicted_direction=p.predicted_direction,
            expected_return_pct=p.expected_return_pct,
            confidence_interval_low=p.confidence_interval_low,
            confidence_interval_high=p.confidence_interval_high,
            model_confidence=p.model_confidence,
            uncertainty_level=p.uncertainty_level,
            is_abstained=p.is_abstained,
            abstain_reason=p.abstain_reason,
            top_factors=p.top_factors or []
        )
        for p in predictions
    ]

@router.post("/{ticker}/train-and-forecast", response_model=PredictionResponse)
def train_and_forecast_stock(
    ticker: str,
    horizon: str = "5D",
    db: Session = Depends(get_db)
):
    from app.models.schema import DailyBar
    from app.services.ml_engine.model_trainer import ai_predictive_engine

    stock = db.query(Stock).filter(Stock.ticker == ticker.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

    bars = (
        db.query(DailyBar)
        .filter(DailyBar.stock_id == stock.id)
        .order_by(DailyBar.date.asc())
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

    forecast = ai_predictive_engine.train_and_forecast(
        ticker=stock.ticker,
        bars=bars_dicts,
        horizon=horizon
    )

    pred = AIPrediction(
        stock_id=stock.id,
        horizon=forecast["horizon"],
        predicted_direction=forecast["predicted_direction"],
        expected_return_pct=forecast["expected_return_pct"],
        confidence_interval_low=forecast["confidence_interval_low"],
        confidence_interval_high=forecast["confidence_interval_high"],
        model_confidence=forecast["model_confidence"],
        uncertainty_level=forecast["uncertainty_level"],
        is_abstained=forecast["is_abstained"],
        abstain_reason=forecast["abstain_reason"],
        top_factors=forecast["top_factors"]
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)

    return PredictionResponse(
        ticker=stock.ticker,
        name=stock.name,
        exchange=stock.exchange,
        currency=stock.currency,
        generated_at=pred.generated_at,
        horizon=pred.horizon,
        predicted_direction=pred.predicted_direction,
        expected_return_pct=pred.expected_return_pct,
        confidence_interval_low=pred.confidence_interval_low,
        confidence_interval_high=pred.confidence_interval_high,
        model_confidence=pred.model_confidence,
        uncertainty_level=pred.uncertainty_level,
        is_abstained=pred.is_abstained,
        abstain_reason=pred.abstain_reason,
        top_factors=pred.top_factors or []
    )

