from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List
from app.database import get_db
from app.models.schema import Stock
from pydantic import BaseModel, ConfigDict
import datetime

router = APIRouter(prefix="/api/scanner", tags=["scanner"])

class StockScannerResponse(BaseModel):
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

@router.get("", response_model=List[StockScannerResponse])
def get_scanner_stocks(
    search: Optional[str] = Query(None, description="Search ticker or company name"),
    exchange: Optional[str] = Query(None, description="Filter by exchange (NASDAQ, NYSE, TSX)"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    min_market_cap: Optional[float] = Query(None, description="Minimum market cap in native currency"),
    min_volume: Optional[float] = Query(None, description="Minimum 30-day average volume"),
    min_rvol: Optional[float] = Query(None, description="Minimum relative volume"),
    liquid_only: bool = Query(True, description="Exclude illiquid stocks"),
    sort_by: str = Query("relative_volume", description="Field to sort by"),
    sort_order: str = Query("desc", description="asc or desc"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Stock).filter(Stock.is_active == True)

    if liquid_only:
        query = query.filter(Stock.is_liquid == True)

    if exchange and exchange.upper() != "ALL":
        query = query.filter(Stock.exchange == exchange.upper())

    if sector and sector.lower() != "all":
        query = query.filter(Stock.sector.ilike(f"%{sector}%"))

    if search:
        s = f"%{search}%"
        query = query.filter((Stock.ticker.ilike(s)) | (Stock.name.ilike(s)))

    if min_market_cap:
        query = query.filter(Stock.market_cap >= min_market_cap)

    if min_volume:
        query = query.filter(Stock.avg_volume_30d >= min_volume)

    if min_rvol:
        query = query.filter(Stock.relative_volume >= min_rvol)

    sort_column = getattr(Stock, sort_by, Stock.relative_volume)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    return query.limit(limit).all()
