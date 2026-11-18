from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models.schema import MarketBrief
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/api/briefs", tags=["briefs"])

class MarketBriefResponse(BaseModel):
    id: int
    brief_date: str
    generated_at: datetime.datetime
    session_type: str
    macro_summary: str
    us_market_sentiment: str
    tsx_market_sentiment: str
    index_futures: Dict[str, Any]
    premarket_movers: List[Dict[str, Any]]
    top_10_opportunities: List[Dict[str, Any]]
    sector_rotation: Dict[str, Any]
    catalysts_and_risks: List[str]
    immutable_hash: str
    disclaimer: str

@router.get("/latest", response_model=MarketBriefResponse)
def get_latest_market_brief(db: Session = Depends(get_db)):
    brief = db.query(MarketBrief).order_by(MarketBrief.brief_date.desc()).first()
    if not brief:
        raise HTTPException(status_code=404, detail="No market briefs generated yet")

    return MarketBriefResponse(
        id=brief.id,
        brief_date=brief.brief_date,
        generated_at=brief.generated_at,
        session_type=brief.session_type,
        macro_summary=brief.macro_summary,
        us_market_sentiment=brief.us_market_sentiment,
        tsx_market_sentiment=brief.tsx_market_sentiment,
        index_futures=brief.index_futures_json or {},
        premarket_movers=brief.premarket_movers_json or [],
        top_10_opportunities=brief.top_10_opportunities or [],
        sector_rotation=brief.sector_rotation_json or {},
        catalysts_and_risks=brief.catalysts_and_risks or [],
        immutable_hash=brief.immutable_hash,
        disclaimer=brief.disclaimer
    )

@router.get("/history", response_model=List[MarketBriefResponse])
def get_brief_history(limit: int = 10, db: Session = Depends(get_db)):
    briefs = db.query(MarketBrief).order_by(MarketBrief.brief_date.desc()).limit(limit).all()
    return [
        MarketBriefResponse(
            id=b.id,
            brief_date=b.brief_date,
            generated_at=b.generated_at,
            session_type=b.session_type,
            macro_summary=b.macro_summary,
            us_market_sentiment=b.us_market_sentiment,
            tsx_market_sentiment=b.tsx_market_sentiment,
            index_futures=b.index_futures_json or {},
            premarket_movers=b.premarket_movers_json or [],
            top_10_opportunities=b.top_10_opportunities or [],
            sector_rotation=b.sector_rotation_json or {},
            catalysts_and_risks=b.catalysts_and_risks or [],
            immutable_hash=b.immutable_hash,
            disclaimer=b.disclaimer
        )
        for b in briefs
    ]
