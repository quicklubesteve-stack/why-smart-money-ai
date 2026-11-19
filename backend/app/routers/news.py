from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models.schema import StockNewsArticle
from app.services.news_service import news_service
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/api/news", tags=["news"])

class StockNewsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticker: str
    secondary_tickers: List[str]
    company_name: str
    headline: str
    summary: str
    source: str
    published_at: str
    publish_cycle: str
    category: str
    sentiment: str
    market_impact_score: float
    action_recommendation: str
    what_to_do_today: str
    key_levels: Dict[str, Any]
    volatility_score: int
    catalyst_type: str
    is_sanitized: bool
    immutable_hash: str

@router.get("", response_model=List[StockNewsResponse])
def get_recent_stock_news(
    ticker: Optional[str] = Query(None, description="Filter by stock ticker"),
    category: Optional[str] = Query(None, description="Filter by category (AI_TECH, EARNINGS_IPO, TSX_CANADIAN, MACRO_FED)"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (BULLISH, BEARISH, NEUTRAL_CAUTION)"),
    action: Optional[str] = Query(None, description="Filter by action (BUY_ACCUMULATE, HOLD_WATCH)"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns recent stock news items posted and updated daily at 5:00 AM America/Toronto time.
    Provides actionable guidance, price levels, and 1-10 volatility scale ratings.
    """
    # Ensure database is seeded/refreshed
    news_service.seed_and_refresh_news(db)

    query = db.query(StockNewsArticle)

    if ticker and ticker.upper() != "ALL":
        t = ticker.upper()
        query = query.filter((StockNewsArticle.ticker == t) | (StockNewsArticle.headline.ilike(f"%{t}%")))

    if category and category.upper() != "ALL":
        query = query.filter(StockNewsArticle.category == category.upper())

    if sentiment and sentiment.upper() != "ALL":
        query = query.filter(StockNewsArticle.sentiment == sentiment.upper())

    if action and action.upper() != "ALL":
        query = query.filter(StockNewsArticle.action_recommendation == action.upper())

    articles = query.order_by(StockNewsArticle.market_impact_score.desc()).limit(limit).all()

    return [
        StockNewsResponse(
            id=a.id,
            ticker=a.ticker,
            secondary_tickers=a.secondary_tickers or [],
            company_name=a.company_name,
            headline=a.headline,
            summary=a.summary,
            source=a.source,
            published_at=a.published_at,
            publish_cycle=a.publish_cycle,
            category=a.category,
            sentiment=a.sentiment,
            market_impact_score=a.market_impact_score,
            action_recommendation=a.action_recommendation,
            what_to_do_today=a.what_to_do_today,
            key_levels=a.key_levels_json or {},
            volatility_score=a.volatility_score,
            catalyst_type=a.catalyst_type,
            is_sanitized=a.is_sanitized,
            immutable_hash=a.immutable_hash
        ) for a in articles
    ]

@router.get("/daily-action")
def get_daily_action_playbook(db: Session = Depends(get_db)):
    """
    Returns today's 5:00 AM America/Toronto Executive Market Action Playbook.
    Directs the user on what to do this day based on recent news and technical factors.
    """
    return news_service.get_daily_action_briefing(db)

@router.get("/{article_id}", response_model=StockNewsResponse)
def get_news_article_by_id(article_id: int, db: Session = Depends(get_db)):
    art = db.query(StockNewsArticle).filter(StockNewsArticle.id == article_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="News article not found")
    return StockNewsResponse(
        id=art.id,
        ticker=art.ticker,
        secondary_tickers=art.secondary_tickers or [],
        company_name=art.company_name,
        headline=art.headline,
        summary=art.summary,
        source=art.source,
        published_at=art.published_at,
        publish_cycle=art.publish_cycle,
        category=art.category,
        sentiment=art.sentiment,
        market_impact_score=art.market_impact_score,
        action_recommendation=art.action_recommendation,
        what_to_do_today=art.what_to_do_today,
        key_levels=art.key_levels_json or {},
        volatility_score=art.volatility_score,
        catalyst_type=art.catalyst_type,
        is_sanitized=art.is_sanitized,
        immutable_hash=art.immutable_hash
    )
