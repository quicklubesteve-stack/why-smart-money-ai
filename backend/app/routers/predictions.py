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
