from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.database import get_db
from app.models.schema import Stock, DailyBar, SmartMoneyMetric
from app.services.simulation_engine import simulation_engine
from app.services.tier_service import tier_service

router = APIRouter(prefix="/api/simulation", tags=["simulation"])

class SimulationRequest(BaseModel):
    ticker: str = "NVDA"
    num_simulations: int = Field(default=2000, ge=10, le=10000)
    horizon_days: int = Field(default=30, ge=5, le=252)
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    include_smart_money_bias: bool = True
    enforce_tier_limit: bool = True

@router.post("/run")
def run_stock_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    ticker = req.ticker.upper()
    stock = db.query(Stock).filter(Stock.ticker == ticker).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock ticker '{ticker}' not found in universe.")

    # Tier verification
    tier_validation = tier_service.validate_simulation_limit(
        requested_simulations=req.num_simulations,
        horizon_days=req.horizon_days
    )

    actual_simulations = req.num_simulations
    actual_horizon = req.horizon_days
    tier_capped = False
    tier_message = None

    if req.enforce_tier_limit and not tier_validation["is_allowed"]:
        tier_capped = True
        actual_simulations = tier_validation["adjusted_simulations"]
        actual_horizon = tier_validation["adjusted_horizon"]
        tier_message = tier_validation["message"]

    # Retrieve historical daily closes
    bars = (
        db.query(DailyBar)
        .filter(DailyBar.stock_id == stock.id)
        .order_by(DailyBar.date.asc())
        .all()
    )
    historical_closes = [b.close for b in bars] if bars else [stock.current_price * 0.95, stock.current_price]

    # Retrieve smart money score
    sm_metric = db.query(SmartMoneyMetric).filter(SmartMoneyMetric.stock_id == stock.id).first()
    sm_score = sm_metric.composite_score if sm_metric else 50.0

    current_price = stock.current_price if (stock.current_price and stock.current_price > 0) else 100.0

    # Auto-calculate default target & stop if not provided
    target_p = req.target_price
    if target_p is None or target_p <= 0:
        target_p = round(current_price * 1.08, 2)  # default +8% target

    stop_p = req.stop_loss
    if stop_p is None or stop_p <= 0:
        stop_p = round(current_price * 0.95, 2)  # default -5% stop

    sim_result = simulation_engine.run_simulation(
        current_price=current_price,
        historical_closes=historical_closes,
        num_simulations=actual_simulations,
        horizon_days=actual_horizon,
        smart_money_score=sm_score,
        include_smart_money_bias=req.include_smart_money_bias,
        target_price=target_p,
        stop_loss=stop_p
    )

    sim_result["ticker"] = stock.ticker
    sim_result["stock_name"] = stock.name
    sim_result["exchange"] = stock.exchange
    sim_result["currency"] = stock.currency
    sim_result["tier_capped"] = tier_capped
    sim_result["tier_message"] = tier_message
    sim_result["current_user_tier"] = tier_service.get_current_tier()
    sim_result["requested_simulations"] = req.num_simulations

    return sim_result
