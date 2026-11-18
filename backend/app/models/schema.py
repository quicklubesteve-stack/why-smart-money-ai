import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    exchange = Column(String, nullable=False)  # NASDAQ, NYSE, TSX
    currency = Column(String, default="USD")   # USD, CAD
    sector = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    market_cap = Column(Float, nullable=True)
    avg_volume_30d = Column(Float, nullable=True)
    current_price = Column(Float, nullable=True)
    change_pct = Column(Float, default=0.0)
    relative_volume = Column(Float, default=1.0)
    volatility_30d = Column(Float, default=0.0)
    spread_pct = Column(Float, default=0.01)
    is_active = Column(Boolean, default=True)
    is_liquid = Column(Boolean, default=True)
    latest_update = Column(DateTime, default=datetime.datetime.utcnow)
    data_source = Column(String, default="DEMO_FEED")

    bars = relationship("DailyBar", back_populates="stock", cascade="all, delete-orphan")
    signals = relationship("TradingSignal", back_populates="stock", cascade="all, delete-orphan")
    predictions = relationship("AIPrediction", back_populates="stock", cascade="all, delete-orphan")
    smart_money = relationship("SmartMoneyMetric", back_populates="stock", cascade="all, delete-orphan")


class DailyBar(Base):
    __tablename__ = "daily_bars"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    vwap = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="bars")


class SmartMoneyMetric(Base):
    __tablename__ = "smart_money_metrics"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    as_of_date = Column(String, nullable=False)
    rel_volume = Column(Float, default=1.0)
    vwap_ratio = Column(Float, default=1.0)
    accumulation_distribution = Column(Float, default=0.0)
    on_balance_volume = Column(Float, default=0.0)
    volume_price_divergence = Column(String, default="Neutral")  # Bullish, Bearish, Neutral
    block_trade_count = Column(Integer, default=0)
    off_exchange_ratio = Column(Float, default=0.0)             # FINRA off-exchange / dark-pool proxy
    institutional_13f_change_pct = Column(Float, default=0.0)   # Net quarterly institutional change
    composite_score = Column(Float, default=50.0)               # 0 - 100
    proxy_confidence = Column(String, default="Medium")         # Low, Medium, High
    explanation = Column(Text, nullable=True)
    disclaimer = Column(Text, default="13F filings are delayed quarterly snapshots. Off-exchange numbers are proxy estimates.")

    stock = relationship("Stock", back_populates="smart_money")


class TradingSignal(Base):
    __tablename__ = "trading_signals"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    horizon = Column(String, default="5D")  # Intraday, Next Day, 5D, 20D
    recommendation = Column(String, nullable=False)  # BUY, WATCH, HOLD, AVOID, SELL/EXIT
    quality_score = Column(Float, default=70.0)     # 0 - 100 quality/strength score
    calibrated_prob = Column(Float, default=0.65)   # 0.0 - 1.0 calibrated statistical probability
    latest_quote = Column(Float, nullable=False)
    entry_zone_min = Column(Float, nullable=False)
    entry_zone_max = Column(Float, nullable=False)
    target_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    risk_reward_ratio = Column(Float, default=2.5)
    estimated_slippage_bps = Column(Integer, default=8)
    invalidation_rule = Column(Text, nullable=True)
    evidence_pro = Column(JSON, default=list)
    evidence_con = Column(JSON, default=list)
    status = Column(String, default="ACTIVE")  # ACTIVE, HIT_TARGET, STOPPED, EXPIRED

    stock = relationship("Stock", back_populates="signals")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    horizon = Column(String, nullable=False)  # Intraday, 1D, 5D, 20D
    predicted_direction = Column(String, nullable=False)  # UP, DOWN, SIDEWAYS
    expected_return_pct = Column(Float, default=0.0)
    confidence_interval_low = Column(Float, default=0.0)
    confidence_interval_high = Column(Float, default=0.0)
    model_confidence = Column(Float, default=0.5)
    uncertainty_level = Column(String, default="Moderate")  # Low, Moderate, High
    is_abstained = Column(Boolean, default=False)
    abstain_reason = Column(String, nullable=True)
    top_factors = Column(JSON, default=list)

    stock = relationship("Stock", back_populates="predictions")


class MarketBrief(Base):
    __tablename__ = "market_briefs"

    id = Column(Integer, primary_key=True, index=True)
    brief_date = Column(String, nullable=False, unique=True)  # YYYY-MM-DD
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    session_type = Column(String, default="5AM_PREMARKET")     # 5AM_PREMARKET, 915AM_REFRESH
    macro_summary = Column(Text, nullable=False)
    us_market_sentiment = Column(String, default="Neutral")
    tsx_market_sentiment = Column(String, default="Neutral")
    index_futures_json = Column(JSON, default=dict)
    premarket_movers_json = Column(JSON, default=list)
    top_10_opportunities = Column(JSON, default=list)
    sector_rotation_json = Column(JSON, default=dict)
    catalysts_and_risks = Column(JSON, default=list)
    immutable_hash = Column(String, nullable=False)
    disclaimer = Column(String, default="At 5 AM ET, premarket volume is incomplete. Gaps are non-final.")


class PaperPortfolio(Base):
    __tablename__ = "paper_portfolios"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, default="PAPER-SMART-001")
    cash_balance = Column(Float, default=100000.0)
    currency = Column(String, default="USD")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    positions = relationship("PaperPosition", back_populates="portfolio", cascade="all, delete-orphan")
    orders = relationship("PaperOrder", back_populates="portfolio", cascade="all, delete-orphan")


class PaperPosition(Base):
    __tablename__ = "paper_positions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("paper_portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False)
    shares = Column(Float, nullable=False)
    average_entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    unrealized_pnl = Column(Float, default=0.0)
    unrealized_pnl_pct = Column(Float, default=0.0)

    portfolio = relationship("PaperPortfolio", back_populates="positions")


class PaperOrder(Base):
    __tablename__ = "paper_orders"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("paper_portfolios.id"), nullable=False)
    ticker = Column(String, nullable=False)
    side = Column(String, nullable=False)  # BUY, SELL
    order_type = Column(String, default="LIMIT")  # MARKET, LIMIT, STOP
    shares = Column(Float, nullable=False)
    requested_price = Column(Float, nullable=False)
    executed_price = Column(Float, nullable=True)
    slippage_bps = Column(Float, default=5.0)
    fee_paid = Column(Float, default=1.0)
    status = Column(String, default="FILLED")  # PENDING, FILLED, REJECTED, CANCELLED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(String, nullable=True)

    portfolio = relationship("PaperPortfolio", back_populates="orders")


class HistoricalPerformance(Base):
    __tablename__ = "historical_performance"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    system_cumulative_return = Column(Float, default=0.0)
    benchmark_spy_return = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.62)
    directional_accuracy = Column(Float, default=0.68)
    sharpe_ratio = Column(Float, default=1.85)
    max_drawdown = Column(Float, default=-0.082)
    sample_trades_count = Column(Integer, default=142)
    brier_calibration_score = Column(Float, default=0.18)
    category = Column(String, default="PAPER_SIMULATION")  # BACKTEST, PAPER_SIMULATION, LIVE
