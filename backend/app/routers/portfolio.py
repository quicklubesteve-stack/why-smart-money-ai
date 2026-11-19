from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.schema import PaperPortfolio, PaperPosition, PaperOrder, Stock
from app.config import settings
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

class PositionResponse(BaseModel):
    id: int
    ticker: str
    shares: float
    average_entry_price: float
    current_price: float
    currency: str
    unrealized_pnl: float
    unrealized_pnl_pct: float

class OrderResponse(BaseModel):
    id: int
    ticker: str
    side: str
    order_type: str
    shares: float
    requested_price: float
    executed_price: Optional[float]
    slippage_bps: float
    fee_paid: float
    status: str
    created_at: datetime.datetime
    executed_at: Optional[datetime.datetime]
    notes: Optional[str]

class PortfolioSummaryResponse(BaseModel):
    account_number: str
    currency: str
    cash_balance: float
    positions_value: float
    total_equity: float
    total_unrealized_pnl: float
    is_live_trading_enabled: bool
    positions: List[PositionResponse]
    recent_orders: List[OrderResponse]

class TradeOrderRequest(BaseModel):
    ticker: str
    side: str  # BUY, SELL
    order_type: str = "LIMIT"
    shares: float
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    confirm_paper_trading: bool = False

@router.get("", response_model=PortfolioSummaryResponse)
def get_portfolio_summary(db: Session = Depends(get_db)):
    portfolio = db.query(PaperPortfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Paper trading portfolio not initialized")

    positions = db.query(PaperPosition).filter(PaperPosition.portfolio_id == portfolio.id).all()
    orders = (
        db.query(PaperOrder)
        .filter(PaperOrder.portfolio_id == portfolio.id)
        .order_by(PaperOrder.created_at.desc())
        .limit(20)
        .all()
    )

    positions_value = sum(p.shares * p.current_price for p in positions)
    total_unrealized_pnl = sum(p.unrealized_pnl for p in positions)
    total_equity = portfolio.cash_balance + positions_value

    return PortfolioSummaryResponse(
        account_number=portfolio.account_number,
        currency=portfolio.currency,
        cash_balance=round(portfolio.cash_balance, 2),
        positions_value=round(positions_value, 2),
        total_equity=round(total_equity, 2),
        total_unrealized_pnl=round(total_unrealized_pnl, 2),
        is_live_trading_enabled=settings.ENABLE_LIVE_TRADING,
        positions=[
            PositionResponse(
                id=p.id,
                ticker=p.ticker,
                shares=p.shares,
                average_entry_price=p.average_entry_price,
                current_price=p.current_price,
                currency=p.currency,
                unrealized_pnl=p.unrealized_pnl,
                unrealized_pnl_pct=p.unrealized_pnl_pct
            )
            for p in positions
        ],
        recent_orders=[
            OrderResponse(
                id=o.id,
                ticker=o.ticker,
                side=o.side,
                order_type=o.order_type,
                shares=o.shares,
                requested_price=o.requested_price,
                executed_price=o.executed_price,
                slippage_bps=o.slippage_bps,
                fee_paid=o.fee_paid,
                status=o.status,
                created_at=o.created_at,
                executed_at=o.executed_at,
                notes=o.notes
            )
            for o in orders
        ]
    )

@router.post("/trade", response_model=OrderResponse)
def execute_paper_trade(req: TradeOrderRequest, db: Session = Depends(get_db)):
    if settings.ENABLE_LIVE_TRADING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Live trading execution is explicitly disabled by security policy."
        )

    if not req.confirm_paper_trading:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation required: Set confirm_paper_trading=True to execute realistic paper order."
        )

    ticker = req.ticker.upper()
    stock = db.query(Stock).filter(Stock.ticker == ticker).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")

    portfolio = db.query(PaperPortfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Paper trading portfolio not found")

    market_price = stock.current_price or 100.0
    req_price = req.limit_price if req.limit_price else market_price

    # Realistic simulated slippage: ~5-15 bps depending on liquidity & spread
    slippage_bps = round(max(3.0, (stock.spread_pct * 10000.0 * 0.5)), 1)
    slippage_factor = 1.0 + (slippage_bps / 10000.0) if req.side.upper() == "BUY" else 1.0 - (slippage_bps / 10000.0)
    exec_price = round(market_price * slippage_factor, 2)
    simulated_fee = 1.00  # $1 per trade flat simulation fee

    total_cost = (exec_price * req.shares) + simulated_fee

    if req.side.upper() == "BUY":
        if portfolio.cash_balance < total_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient simulated cash balance. Required: ${total_cost:.2f}, Available: ${portfolio.cash_balance:.2f}"
            )
        # Check position sizing safeguard (e.g., max 25% portfolio in single asset)
        total_portfolio_est = portfolio.cash_balance + sum(p.shares * p.current_price for p in portfolio.positions)
        if (total_cost / total_portfolio_est) > 0.25:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Risk guardrail triggered: Simulated order exceeds maximum 25% single-position allocation."
            )

        portfolio.cash_balance -= total_cost
        pos = db.query(PaperPosition).filter(
            PaperPosition.portfolio_id == portfolio.id,
            PaperPosition.ticker == ticker
        ).first()

        if pos:
            new_shares = pos.shares + req.shares
            pos.average_entry_price = round(((pos.shares * pos.average_entry_price) + (req.shares * exec_price)) / new_shares, 2)
            pos.shares = new_shares
            pos.current_price = market_price
            pos.unrealized_pnl = round((pos.current_price - pos.average_entry_price) * pos.shares, 2)
            pos.unrealized_pnl_pct = round(((pos.current_price - pos.average_entry_price) / pos.average_entry_price) * 100.0, 2)
        else:
            new_pos = PaperPosition(
                portfolio_id=portfolio.id,
                ticker=ticker,
                shares=req.shares,
                average_entry_price=exec_price,
                current_price=market_price,
                currency=stock.currency,
                unrealized_pnl=round((market_price - exec_price) * req.shares, 2),
                unrealized_pnl_pct=round(((market_price - exec_price) / exec_price) * 100.0, 2)
            )
            db.add(new_pos)

    elif req.side.upper() == "SELL":
        pos = db.query(PaperPosition).filter(
            PaperPosition.portfolio_id == portfolio.id,
            PaperPosition.ticker == ticker
        ).first()
        if not pos or pos.shares < req.shares:
            available = pos.shares if pos else 0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient shares to sell. Owned: {available}, Requested: {req.shares}"
            )

        proceeds = (exec_price * req.shares) - simulated_fee
        portfolio.cash_balance += proceeds
        pos.shares -= req.shares
        if pos.shares <= 0.0001:
            db.delete(pos)
        else:
            pos.unrealized_pnl = round((market_price - pos.average_entry_price) * pos.shares, 2)
            pos.unrealized_pnl_pct = round(((market_price - pos.average_entry_price) / pos.average_entry_price) * 100.0, 2)

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    order = PaperOrder(
        portfolio_id=portfolio.id,
        ticker=ticker,
        side=req.side.upper(),
        order_type=req.order_type.upper(),
        shares=req.shares,
        requested_price=req_price,
        executed_price=exec_price,
        slippage_bps=slippage_bps,
        fee_paid=simulated_fee,
        status="FILLED",
        created_at=now_utc,
        executed_at=now_utc,
        notes=f"Simulated internal fill on Acer Windows node with {slippage_bps} bps slippage"
    )
    db.add(order)
    portfolio.updated_at = now_utc
    db.commit()

    return OrderResponse(
        id=order.id,
        ticker=order.ticker,
        side=order.side,
        order_type=order.order_type,
        shares=order.shares,
        requested_price=order.requested_price,
        executed_price=order.executed_price,
        slippage_bps=order.slippage_bps,
        fee_paid=order.fee_paid,
        status=order.status,
        created_at=order.created_at,
        executed_at=order.executed_at,
        notes=order.notes
    )

class ClosePositionRequest(BaseModel):
    ticker: str
    confirm_paper_trading: bool = False

@router.post("/close-position", response_model=OrderResponse)
def close_paper_position(req: ClosePositionRequest, db: Session = Depends(get_db)):
    """
    Exits 100% of an open simulated position at market price with simulated slippage and commission.
    """
    if settings.ENABLE_LIVE_TRADING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Live trading execution is explicitly disabled by security policy."
        )

    if not req.confirm_paper_trading:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation required: Set confirm_paper_trading=True to close position in paper simulator."
        )

    ticker = req.ticker.upper()
    portfolio = db.query(PaperPortfolio).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Paper trading portfolio not found")

    pos = db.query(PaperPosition).filter(
        PaperPosition.portfolio_id == portfolio.id,
        PaperPosition.ticker == ticker
    ).first()

    if not pos or pos.shares <= 0:
        raise HTTPException(status_code=404, detail=f"No open position found for ticker '{ticker}'")

    stock = db.query(Stock).filter(Stock.ticker == ticker).first()
    market_price = stock.current_price if (stock and stock.current_price) else pos.current_price

    spread_bps = max(3.0, (stock.spread_pct * 10000.0 * 0.5)) if stock else 5.0
    slippage_bps = round(spread_bps, 1)
    exec_price = round(market_price * (1.0 - (slippage_bps / 10000.0)), 2)
    simulated_fee = 1.00

    shares_to_close = pos.shares
    gross_proceeds = exec_price * shares_to_close
    net_proceeds = gross_proceeds - simulated_fee
    realized_pnl = round(net_proceeds - (pos.average_entry_price * shares_to_close), 2)

    portfolio.cash_balance += net_proceeds
    db.delete(pos)

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    order = PaperOrder(
        portfolio_id=portfolio.id,
        ticker=ticker,
        side="SELL",
        order_type="MARKET",
        shares=shares_to_close,
        requested_price=market_price,
        executed_price=exec_price,
        slippage_bps=slippage_bps,
        fee_paid=simulated_fee,
        status="FILLED",
        created_at=now_utc,
        executed_at=now_utc,
        notes=f"Position closed at market. Realized P&L: ${realized_pnl:.2f} ({slippage_bps} bps slippage)"
    )
    db.add(order)
    portfolio.updated_at = now_utc
    db.commit()

    return OrderResponse(
        id=order.id,
        ticker=order.ticker,
        side=order.side,
        order_type=order.order_type,
        shares=order.shares,
        requested_price=order.requested_price,
        executed_price=order.executed_price,
        slippage_bps=order.slippage_bps,
        fee_paid=order.fee_paid,
        status=order.status,
        created_at=order.created_at,
        executed_at=order.executed_at,
        notes=order.notes
    )
