import datetime
import hashlib
import json
import random
import numpy as np
from sqlalchemy.orm import Session
from app.models.schema import (
    Stock, DailyBar, SmartMoneyMetric, TradingSignal, AIPrediction,
    MarketBrief, PaperPortfolio, PaperPosition, PaperOrder, HistoricalPerformance
)

SEED_STOCKS = [
    {
        "ticker": "NVDA",
        "name": "NVIDIA Corporation",
        "exchange": "NASDAQ",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Semiconductors",
        "market_cap": 3100000000000.0,
        "current_price": 128.50,
        "change_pct": 2.85,
        "relative_volume": 2.45,
        "volatility_30d": 0.38,
        "spread_pct": 0.0003,
        "avg_volume_30d": 45000000.0,
        "is_liquid": True
    },
    {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "exchange": "NASDAQ",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Consumer Electronics",
        "market_cap": 3450000000000.0,
        "current_price": 224.20,
        "change_pct": 0.65,
        "relative_volume": 1.15,
        "volatility_30d": 0.22,
        "spread_pct": 0.0002,
        "avg_volume_30d": 52000000.0,
        "is_liquid": True
    },
    {
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "exchange": "NASDAQ",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Software - Infrastructure",
        "market_cap": 3150000000000.0,
        "current_price": 422.80,
        "change_pct": 1.12,
        "relative_volume": 1.30,
        "volatility_30d": 0.24,
        "spread_pct": 0.0002,
        "avg_volume_30d": 21000000.0,
        "is_liquid": True
    },
    {
        "ticker": "PLTR",
        "name": "Palantir Technologies Inc.",
        "exchange": "NYSE",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Software - Infrastructure",
        "market_cap": 145000000000.0,
        "current_price": 64.15,
        "change_pct": 4.10,
        "relative_volume": 3.10,
        "volatility_30d": 0.52,
        "spread_pct": 0.0006,
        "avg_volume_30d": 65000000.0,
        "is_liquid": True
    },
    {
        "ticker": "AMZN",
        "name": "Amazon.com Inc.",
        "exchange": "NASDAQ",
        "currency": "USD",
        "sector": "Consumer Cyclical",
        "industry": "Internet Retail",
        "market_cap": 2100000000000.0,
        "current_price": 204.60,
        "change_pct": -0.45,
        "relative_volume": 0.95,
        "volatility_30d": 0.26,
        "spread_pct": 0.0003,
        "avg_volume_30d": 38000000.0,
        "is_liquid": True
    },
    {
        "ticker": "TSLA",
        "name": "Tesla Inc.",
        "exchange": "NASDAQ",
        "currency": "USD",
        "sector": "Consumer Cyclical",
        "industry": "Auto Manufacturers",
        "market_cap": 1050000000000.0,
        "current_price": 338.25,
        "change_pct": 3.60,
        "relative_volume": 2.80,
        "volatility_30d": 0.58,
        "spread_pct": 0.0004,
        "avg_volume_30d": 72000000.0,
        "is_liquid": True
    },
    {
        "ticker": "AMD",
        "name": "Advanced Micro Devices, Inc.",
        "exchange": "NASDAQ",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Semiconductors",
        "market_cap": 225000000000.0,
        "current_price": 138.90,
        "change_pct": -1.20,
        "relative_volume": 1.40,
        "volatility_30d": 0.44,
        "spread_pct": 0.0005,
        "avg_volume_30d": 48000000.0,
        "is_liquid": True
    },
    {
        "ticker": "SPY",
        "name": "SPDR S&P 500 ETF Trust",
        "exchange": "NYSE Arca",
        "currency": "USD",
        "sector": "ETF",
        "industry": "Index ETF",
        "market_cap": 580000000000.0,
        "current_price": 588.40,
        "change_pct": 0.40,
        "relative_volume": 1.05,
        "volatility_30d": 0.14,
        "spread_pct": 0.0001,
        "avg_volume_30d": 55000000.0,
        "is_liquid": True
    },
    {
        "ticker": "SHOP.TO",
        "name": "Shopify Inc.",
        "exchange": "TSX",
        "currency": "CAD",
        "sector": "Technology",
        "industry": "Software - Application",
        "market_cap": 142000000000.0,
        "current_price": 148.75,
        "change_pct": 3.25,
        "relative_volume": 2.20,
        "volatility_30d": 0.42,
        "spread_pct": 0.0007,
        "avg_volume_30d": 2800000.0,
        "is_liquid": True
    },
    {
        "ticker": "RY.TO",
        "name": "Royal Bank of Canada",
        "exchange": "TSX",
        "currency": "CAD",
        "sector": "Financial Services",
        "industry": "Banks - Diversified",
        "market_cap": 235000000000.0,
        "current_price": 168.40,
        "change_pct": 0.35,
        "relative_volume": 1.10,
        "volatility_30d": 0.15,
        "spread_pct": 0.0004,
        "avg_volume_30d": 3200000.0,
        "is_liquid": True
    },
    {
        "ticker": "TD.TO",
        "name": "Toronto-Dominion Bank",
        "exchange": "TSX",
        "currency": "CAD",
        "sector": "Financial Services",
        "industry": "Banks - Diversified",
        "market_cap": 138000000000.0,
        "current_price": 79.80,
        "change_pct": -0.80,
        "relative_volume": 1.35,
        "volatility_30d": 0.20,
        "spread_pct": 0.0005,
        "avg_volume_30d": 4500000.0,
        "is_liquid": True
    },
    {
        "ticker": "ENB.TO",
        "name": "Enbridge Inc.",
        "exchange": "TSX",
        "currency": "CAD",
        "sector": "Energy",
        "industry": "Oil & Gas Midstream",
        "market_cap": 120000000000.0,
        "current_price": 55.60,
        "change_pct": 0.45,
        "relative_volume": 0.90,
        "volatility_30d": 0.16,
        "spread_pct": 0.0004,
        "avg_volume_30d": 5200000.0,
        "is_liquid": True
    }
]

def generate_historical_bars(base_price: float, days: int = 60):
    bars = []
    current_date = datetime.date.today() - datetime.timedelta(days=days * 1.5)
    price = base_price * 0.88
    
    generated = 0
    while generated < days:
        current_date += datetime.timedelta(days=1)
        # Skip weekends
        if current_date.weekday() >= 5:
            continue
        
        daily_return = np.random.normal(0.0008, 0.018)
        price = max(price * (1 + daily_return), 1.0)
        daily_range = price * np.random.uniform(0.015, 0.035)
        
        open_p = price - (daily_range * np.random.uniform(-0.4, 0.4))
        high_p = max(open_p, price) + (daily_range * np.random.uniform(0.1, 0.5))
        low_p = min(open_p, price) - (daily_range * np.random.uniform(0.1, 0.5))
        close_p = price
        volume = float(np.random.randint(500000, 35000000))
        vwap = (high_p + low_p + close_p) / 3.0
        
        bars.append({
            "date": current_date.isoformat(),
            "open": round(open_p, 2),
            "high": round(high_p, 2),
            "low": round(low_p, 2),
            "close": round(close_p, 2),
            "volume": volume,
            "vwap": round(vwap, 2)
        })
        generated += 1
        
    return bars

def seed_database(db: Session):
    existing_stocks = db.query(Stock).count()
    if existing_stocks > 0:
        return

    print("Seeding initial realistic demonstration market data...")
    stocks_map = {}

    for s_data in SEED_STOCKS:
        stock = Stock(
            ticker=s_data["ticker"],
            name=s_data["name"],
            exchange=s_data["exchange"],
            currency=s_data["currency"],
            sector=s_data["sector"],
            industry=s_data["industry"],
            market_cap=s_data["market_cap"],
            current_price=s_data["current_price"],
            change_pct=s_data["change_pct"],
            relative_volume=s_data["relative_volume"],
            volatility_30d=s_data["volatility_30d"],
            spread_pct=s_data["spread_pct"],
            avg_volume_30d=s_data["avg_volume_30d"],
            is_liquid=s_data["is_liquid"],
            is_active=True,
            data_source="DEMO_SYNTHETIC_FEED"
        )
        db.add(stock)
        db.flush()
        stocks_map[s_data["ticker"]] = stock

        # Seed 60 daily bars
        bars_data = generate_historical_bars(s_data["current_price"], days=60)
        # Ensure the final bar close matches current_price
        if bars_data:
            bars_data[-1]["close"] = s_data["current_price"]
        for b in bars_data:
            bar = DailyBar(
                stock_id=stock.id,
                date=b["date"],
                open=b["open"],
                high=b["high"],
                low=b["low"],
                close=b["close"],
                volume=b["volume"],
                vwap=b["vwap"]
            )
            db.add(bar)

        # Smart Money Indicators
        divergence = "Bullish" if s_data["change_pct"] > 0 and s_data["relative_volume"] > 1.5 else "Neutral"
        if s_data["change_pct"] < -1.0 and s_data["relative_volume"] > 1.8:
            divergence = "Bearish"
        
        score = min(92.0, max(25.0, 50.0 + (s_data["change_pct"] * 3) + (s_data["relative_volume"] * 10)))
        
        sm_metric = SmartMoneyMetric(
            stock_id=stock.id,
            as_of_date=datetime.date.today().isoformat(),
            rel_volume=s_data["relative_volume"],
            vwap_ratio=round(1.0 + (s_data["change_pct"] / 100 * 0.7), 3),
            accumulation_distribution=round(s_data["market_cap"] * 0.000001 * s_data["relative_volume"], 2),
            on_balance_volume=round(s_data["avg_volume_30d"] * (1.2 if s_data["change_pct"] > 0 else 0.8), 2),
            volume_price_divergence=divergence,
            block_trade_count=int(s_data["relative_volume"] * 24),
            off_exchange_ratio=round(0.38 + (s_data["relative_volume"] * 0.03), 3),
            institutional_13f_change_pct=round(3.4 if s_data["ticker"] in ["NVDA", "PLTR", "SHOP.TO"] else -0.8, 2),
            composite_score=round(score, 1),
            proxy_confidence="High" if s_data["relative_volume"] > 1.5 else "Medium",
            explanation=f"Elevated relative volume ({s_data['relative_volume']}x) paired with {divergence.lower()} volume-price action. Off-exchange volume proxy indicates active institutional block participation.",
            disclaimer="NOTE: SEC 13F filings are delayed by up to 45 days and represent quarterly historical snapshots, not real-time positions. Dark pool and off-exchange percentages are proxy estimates based on trade flags."
        )
        db.add(sm_metric)

        # Trading Signals
        rec = "WATCH"
        cal_prob = 0.55
        if score >= 75:
            rec = "BUY"
            cal_prob = 0.68
        elif score <= 40:
            rec = "AVOID"
            cal_prob = 0.42

        entry_min = round(s_data["current_price"] * 0.985, 2)
        entry_max = round(s_data["current_price"] * 1.008, 2)
        target = round(s_data["current_price"] * 1.075, 2) if rec == "BUY" else round(s_data["current_price"] * 1.03, 2)
        stop = round(s_data["current_price"] * 0.955, 2)
        rr = round((target - entry_max) / max(0.01, (entry_max - stop)), 2)

        signal = TradingSignal(
            stock_id=stock.id,
            horizon="5D",
            recommendation=rec,
            quality_score=round(score, 1),
            calibrated_prob=cal_prob,
            latest_quote=s_data["current_price"],
            entry_zone_min=entry_min,
            entry_zone_max=entry_max,
            target_price=target,
            stop_loss=stop,
            risk_reward_ratio=max(1.5, rr),
            estimated_slippage_bps=8,
            invalidation_rule=f"Signal invalidated if daily close breaches ${stop} or RVOL drops below 1.1x during regular session.",
            evidence_pro=[
                f"Relative Volume at {s_data['relative_volume']}x average",
                f"Sustained price above 20-day VWAP ({s_data['currency']})",
                "Positive institutional 13F net accumulation trend (last quarter)"
            ],
            evidence_con=[
                f"Estimated slippage buffer: ~8 bps due to bid-ask spread {s_data['spread_pct']*100:.2f}%",
                "Macro sensitivity to impending central bank rate announcements"
            ],
            status="ACTIVE"
        )
        db.add(signal)

        # AI Predictions
        prediction = AIPrediction(
            stock_id=stock.id,
            horizon="5D",
            predicted_direction="UP" if s_data["change_pct"] >= 0 else "DOWN",
            expected_return_pct=round(s_data["change_pct"] * 0.8 + 1.2, 2),
            confidence_interval_low=round(-1.8, 2),
            confidence_interval_high=round(4.6, 2),
            model_confidence=round(cal_prob, 2),
            uncertainty_level="Low" if s_data["volatility_30d"] < 0.3 else "Moderate",
            is_abstained=False,
            abstain_reason=None,
            top_factors=[
                {"feature": "Order Flow Proxy Index", "importance": 0.34},
                {"feature": "Relative Volume Divergence", "importance": 0.28},
                {"feature": "Distance to 20-day VWAP", "importance": 0.21},
                {"feature": "Sector Relative Strength", "importance": 0.17}
            ]
        )
        db.add(prediction)

    # 5 AM Market Brief
    today_str = datetime.date.today().isoformat()
    brief_content = (
        "5:00 AM AMERICA/TORONTO MARKET BRIEF: Premarket index futures indicate a modest risk-on posture "
        "across US equity markets with S&P 500 mini futures trading +0.28% and Nasdaq 100 mini futures +0.42%. "
        "TSX 60 futures indicate constructive opening tone (+0.21%) supported by resilient energy midstream and financial flows. "
        "IMPORTANT: Premarket trading volume at 5:00 AM ET represents early liquidity (typically <5% of regular session depth). "
        "Opening price gaps are non-final and must be evaluated against 9:30 AM regular session volume confirmation."
    )
    brief_hash = hashlib.sha256((today_str + brief_content).encode("utf-8")).hexdigest()

    top_10 = [
        {"rank": 1, "ticker": "NVDA", "exchange": "NASDAQ", "score": 88.5, "signal": "BUY", "catalyst": "Semiconductor institutional accumulation proxy spike"},
        {"rank": 2, "ticker": "PLTR", "exchange": "NYSE", "score": 86.2, "signal": "BUY", "catalyst": "Enterprise AI contract expansions & 3.1x RVOL"},
        {"rank": 3, "ticker": "SHOP.TO", "exchange": "TSX", "score": 83.4, "signal": "BUY", "catalyst": "Cross-border merchant volume momentum (CAD)"},
        {"rank": 4, "ticker": "TSLA", "exchange": "NASDAQ", "score": 79.1, "signal": "BUY", "catalyst": "Autonomous fleet headlines & call option volume"},
        {"rank": 5, "ticker": "MSFT", "exchange": "NASDAQ", "score": 75.8, "signal": "BUY", "catalyst": "Cloud Azure enterprise spending stability"},
        {"rank": 6, "ticker": "AAPL", "exchange": "NASDAQ", "score": 72.0, "signal": "WATCH", "catalyst": "Hardware upgrade cycle review"},
        {"rank": 7, "ticker": "RY.TO", "exchange": "TSX", "score": 69.5, "signal": "WATCH", "catalyst": "Canadian banking net interest margin resilience"},
        {"rank": 8, "ticker": "ENB.TO", "exchange": "TSX", "score": 67.2, "signal": "HOLD", "catalyst": "Defensive dividend yield support"},
        {"rank": 9, "ticker": "AMZN", "exchange": "NASDAQ", "score": 64.0, "signal": "WATCH", "catalyst": "E-commerce logistics efficiency steady"},
        {"rank": 10, "ticker": "AMD", "exchange": "NASDAQ", "score": 58.0, "signal": "HOLD", "catalyst": "Data center server chip competition"}
    ]

    brief = MarketBrief(
        brief_date=today_str,
        session_type="5AM_PREMARKET",
        macro_summary=brief_content,
        us_market_sentiment="Constructive Bullish",
        tsx_market_sentiment="Cautiously Optimistic",
        index_futures_json={
            "ES_FUT": {"name": "S&P 500 E-mini", "price": 5912.50, "change_pct": 0.28},
            "NQ_FUT": {"name": "Nasdaq 100 E-mini", "price": 20840.25, "change_pct": 0.42},
            "SXF_FUT": {"name": "S&P/TSX 60 Index Futures", "price": 1412.80, "change_pct": 0.21},
            "VIX": {"name": "Cboe Volatility Index", "price": 14.85, "change_pct": -2.10}
        },
        premarket_movers_json=[
            {"ticker": "NVDA", "premarket_price": 130.15, "gap_pct": 1.28, "premarket_volume": 420000, "note": "Early tech bid"},
            {"ticker": "PLTR", "premarket_price": 65.40, "gap_pct": 1.95, "premarket_volume": 310000, "note": "Strong institutional dark-pool continuation"},
            {"ticker": "AMD", "premarket_price": 137.80, "gap_pct": -0.79, "premarket_volume": 95000, "note": "Minor consolidation"}
        ],
        top_10_opportunities=top_10,
        sector_rotation_json={
            "Leading": ["Semiconductors", "Software Infrastructure", "Digital Commerce"],
            "Improving": ["Financials (TSX)", "Industrial Technology"],
            "Lagging": ["Utilities", "Traditional Energy"]
        },
        catalysts_and_risks=[
            "Federal Reserve FOMC minutes scheduled for Wednesday 2:00 PM ET",
            "Bank of Canada monetary policy commentary on interest rate trajectory",
            "US Initial Jobless Claims release Thursday 8:30 AM ET",
            "Caution: 5 AM prices reflect thin premarket books; avoid placing market orders prior to 9:30 AM regular session"
        ],
        immutable_hash=brief_hash
    )
    db.add(brief)

    # Paper Trading Portfolio & Positions
    portfolio = PaperPortfolio(
        account_number="SIM-TORONTO-001",
        cash_balance=72450.00,
        currency="USD"
    )
    db.add(portfolio)
    db.flush()

    pos1 = PaperPosition(
        portfolio_id=portfolio.id,
        ticker="NVDA",
        shares=100.0,
        average_entry_price=121.40,
        current_price=128.50,
        currency="USD",
        unrealized_pnl=710.00,
        unrealized_pnl_pct=5.85
    )
    pos2 = PaperPosition(
        portfolio_id=portfolio.id,
        ticker="PLTR",
        shares=200.0,
        average_entry_price=59.20,
        current_price=64.15,
        currency="USD",
        unrealized_pnl=990.00,
        unrealized_pnl_pct=8.36
    )
    pos3 = PaperPosition(
        portfolio_id=portfolio.id,
        ticker="SHOP.TO",
        shares=50.0,
        average_entry_price=142.10,
        current_price=148.75,
        currency="CAD",
        unrealized_pnl=332.50,
        unrealized_pnl_pct=4.68
    )
    db.add_all([pos1, pos2, pos3])

    # Paper Orders History
    order1 = PaperOrder(
        portfolio_id=portfolio.id,
        ticker="NVDA",
        side="BUY",
        order_type="LIMIT",
        shares=100.0,
        requested_price=121.35,
        executed_price=121.40,
        slippage_bps=4.1,
        fee_paid=1.00,
        status="FILLED",
        notes="Executed via internal paper simulation with simulated bid-ask slippage"
    )
    order2 = PaperOrder(
        portfolio_id=portfolio.id,
        ticker="PLTR",
        side="BUY",
        order_type="LIMIT",
        shares=200.0,
        requested_price=59.15,
        executed_price=59.20,
        slippage_bps=8.4,
        fee_paid=1.00,
        status="FILLED",
        notes="Executed via internal paper simulation with simulated bid-ask slippage"
    )
    db.add_all([order1, order2])

    # Historical Performance Tracking Records (Backtest vs Paper vs Benchmark)
    perf_records = [
        {"date": "2026-08-01", "system": 0.0, "spy": 0.0, "win_rate": 0.61},
        {"date": "2026-08-15", "system": 2.4, "spy": 1.1, "win_rate": 0.62},
        {"date": "2026-09-01", "system": 5.8, "spy": 2.3, "win_rate": 0.64},
        {"date": "2026-09-15", "system": 7.2, "spy": 1.8, "win_rate": 0.63},
        {"date": "2026-10-01", "system": 11.5, "spy": 3.4, "win_rate": 0.65},
        {"date": "2026-10-15", "system": 14.1, "spy": 4.8, "win_rate": 0.64},
        {"date": "2026-11-01", "system": 18.2, "spy": 5.9, "win_rate": 0.66},
        {"date": "2026-11-15", "system": 21.6, "spy": 7.1, "win_rate": 0.65}
    ]

    for p in perf_records:
        hp = HistoricalPerformance(
            date=p["date"],
            system_cumulative_return=p["system"],
            benchmark_spy_return=p["spy"],
            win_rate=p["win_rate"],
            directional_accuracy=0.69,
            sharpe_ratio=1.92,
            max_drawdown=-0.074,
            sample_trades_count=184,
            brier_calibration_score=0.165,
            category="PAPER_SIMULATION"
        )
        db.add(hp)

    db.commit()
    print("Database successfully seeded with realistic US and TSX market data.")
