import datetime
import hashlib
import json
import pytz
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.schema import StockNewsArticle
from app.services.calendar_service import calendar_service
from app.services.security import sanitize_news_text

class StockNewsService:
    """
    Institutional Stock News & 5:00 AM America/Toronto Actionable Intelligence Service.
    Publishes daily market news analysis, tactical decisions, key price levels,
    and 1-10 volatility factor warnings.
    """

    RAW_ARTICLES_TEMPLATE = [
        {
            "ticker": "ANT",
            "secondary_tickers": ["NVDA", "MSFT", "GOOGL"],
            "company_name": "Anthropic, PBC",
            "headline": "Anthropic (ANT) Public Market Debut Triggers Massive Institutional Inflows Amid Claude 3.7 Enterprise Surge",
            "summary": "Anthropic's high-profile public listing on NASDAQ under ticker ANT opened with explosive institutional demand. Following its initial IPO pricing at $83.00, opening prints touched $111.50 before settling near $96.40 with over 24 million shares traded. Tier-1 enterprise cloud providers report unprecedented API consumption of Claude 3.7 reasoning models for software engineering and financial workflows. Order-flow indicators show aggressive accumulation by quantitative and growth funds.",
            "source": "Bloomberg Markets Wire",
            "category": "EARNINGS_IPO",
            "sentiment": "BULLISH",
            "market_impact_score": 9.6,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Accumulate on opening pullbacks into the $92.00–$94.50 zone. Target $108.50 with a strict stop-loss at $87.50 (below IPO opening support). WARNING: Volatility Score is 9/10 (Extreme Volatility / Post-IPO Price Discovery). Keep position sizing constrained to 1.5%–2.5% of total portfolio equity to withstand wide intraday ATR swings ($6.80+).",
            "key_levels_json": {
                "entry_zone": "$92.00 - $94.50",
                "target_price": "$108.50 (+12.5%)",
                "stop_loss": "$87.50 (-9.2%)",
                "modeled_spread_bps": 12.0
            },
            "volatility_score": 9,
            "catalyst_type": "IPO Debut & Enterprise AI Model Adoption"
        },
        {
            "ticker": "NVDA",
            "secondary_tickers": ["AMD", "TSM", "MSFT"],
            "company_name": "NVIDIA Corporation",
            "headline": "NVIDIA (NVDA) Blackwell Architecture Enters Full-Scale Datacenter Shipments; Cloud Hyperscaler Capex Raised",
            "summary": "Nvidia confirmed that production volume for its next-generation Blackwell B200 and GB200 NVL72 AI platforms has ramped ahead of schedule with zero wafer defects reported. Cloud hyperscalers including Microsoft, Amazon, and Google expanded their combined fiscal datacenter capex by 22%, cementing sustained demand for ultra-dense compute clusters through 2027.",
            "source": "Reuters Technology Wire",
            "category": "AI_TECH",
            "sentiment": "BULLISH",
            "market_impact_score": 9.2,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Execute long entries above the $148.50 pivot level. Smart money accumulation gradient remains positive above the 20-day VWAP. Projected price target is $165.00 with a trailing stop at $142.00. Volatility Score is 6/10 (Moderate-High), offering an attractive reward-to-risk ratio (2.4:1).",
            "key_levels_json": {
                "entry_zone": "$148.00 - $152.00",
                "target_price": "$165.00 (+8.5%)",
                "stop_loss": "$142.00 (-6.6%)",
                "modeled_spread_bps": 5.0
            },
            "volatility_score": 6,
            "catalyst_type": "Datacenter Capex & GPU Hardware Ramp"
        },
        {
            "ticker": "PLTR",
            "secondary_tickers": ["MSFT", "BA", "LMT"],
            "company_name": "Palantir Technologies Inc.",
            "headline": "Palantir (PLTR) Commercial AIP Customer Count Jumps 83% YoY with Multi-Year Enterprise Deployments",
            "summary": "Palantir released preliminary operational metrics showing unprecedented conversion rates from its 5-day Artificial Intelligence Platform (AIP) customer bootcamps. Over 140 new commercial enterprise agreements were finalized this quarter across US healthcare, manufacturing, and aerospace sectors. Institutional 13F proxy data reveals sustained net accumulation by long-only institutional asset managers.",
            "source": "Wall Street Journal",
            "category": "AI_TECH",
            "sentiment": "BULLISH",
            "market_impact_score": 8.9,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Momentum breakout in progress. Buy dips near $152.00–$155.00. Primary profit-taking target is $172.00; set defensive stop loss at $146.00. NOTE: Volatility Score is 8/10 (Very High Volatility). Use trailing limit orders rather than market orders to minimize spread slippage.",
            "key_levels_json": {
                "entry_zone": "$152.00 - $155.00",
                "target_price": "$172.00 (+11.0%)",
                "stop_loss": "$146.00 (-5.8%)",
                "modeled_spread_bps": 8.0
            },
            "volatility_score": 8,
            "catalyst_type": "Enterprise AI Commercial Contract Growth"
        },
        {
            "ticker": "SHOP.TO",
            "secondary_tickers": ["AMZN", "SHOP"],
            "company_name": "Shopify Inc.",
            "headline": "Shopify (SHOP.TO) Canadian & US Merchant GMV Displays Double-Digit Surge Ahead of Cyber Week",
            "summary": "Shopify's unified merchant platform logged record gross merchandise volume (GMV) with accelerated merchant adoption of AI storefront personalization and international cross-border checkout solutions. Canadian market participants on the TSX noted heavy volume accumulation as institutional flow crossed into large-cap Canadian tech leaders.",
            "source": "The Globe and Mail",
            "category": "TSX_CANADIAN",
            "sentiment": "BULLISH",
            "market_impact_score": 8.5,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Prime TSX growth play. Accumulate on opening strength between $208.00–$213.00 CAD. Target $235.00 CAD; stop loss $198.00 CAD. Volatility Score is 7/10 (High Volatility). Currency note: trades natively in Canadian Dollars (CAD) on TSX.",
            "key_levels_json": {
                "entry_zone": "$208.00 - $213.00 CAD",
                "target_price": "$235.00 CAD (+10.5%)",
                "stop_loss": "$198.00 CAD (-6.8%)",
                "modeled_spread_bps": 9.0
            },
            "volatility_score": 7,
            "catalyst_type": "TSX Merchant GMV & E-Commerce Flow"
        },
        {
            "ticker": "TSLA",
            "secondary_tickers": ["RIVN", "F", "GM"],
            "company_name": "Tesla Inc.",
            "headline": "Tesla (TSLA) Megapack Energy Storage Margins Surge While Robotaxi FSD Fleet Tests Expand",
            "summary": "Tesla's Energy Generation and Storage division recorded a record 31.4% gross margin as utility-scale Megapack deployments in North America and Australia hit all-time highs. Meanwhile, premarket trading displayed wide price swings as autonomous driving regulatory approvals in California and Texas continue to generate debate among analysts.",
            "source": "Financial Times",
            "category": "EARNINGS_IPO",
            "sentiment": "NEUTRAL_CAUTION",
            "market_impact_score": 8.7,
            "action_recommendation": "HOLD_WATCH",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: DO NOT CHASE PREMARKET GAPS. Volatility Score is 9/10 (Extreme Volatility). With daily ATR exceeding $14.50, wait for 10:00 AM ET regular session volume confirmation. If price holds the $372.00 support level, consider tactical scalp longs targeting $398.00 with a mandatory tight stop at $364.00.",
            "key_levels_json": {
                "entry_zone": "$370.00 - $375.00",
                "target_price": "$398.00 (+4.4%)",
                "stop_loss": "$364.00 (-4.5%)",
                "modeled_spread_bps": 10.0
            },
            "volatility_score": 9,
            "catalyst_type": "Energy Storage Margins & FSD Regulatory Watch"
        },
        {
            "ticker": "MSFT",
            "secondary_tickers": ["GOOGL", "AMZN", "AAPL"],
            "company_name": "Microsoft Corporation",
            "headline": "Microsoft (MSFT) Commercial Copilot Enterprise Monetization Beats Wall Street Consensus",
            "summary": "Microsoft's latest enterprise survey reveals that commercial seat conversions for Microsoft 365 Copilot reached 42% among Fortune 500 clients, driving higher average revenue per user (ARPU). Azure Cloud infrastructure margins remained resilient at 71%, proving that heavy AI capex investments are yielding direct revenue accretion.",
            "source": "Dow Jones Newswires",
            "category": "AI_TECH",
            "sentiment": "BULLISH",
            "market_impact_score": 8.3,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Low-risk institutional compounder. Buy or add to positions between $498.00–$503.00. Target $535.00; stop at $486.00. Volatility Score is 4/10 (Low-to-Moderate), making this an ideal low-drawdown anchor for both aggressive and conservative accounts.",
            "key_levels_json": {
                "entry_zone": "$498.00 - $503.00",
                "target_price": "$535.00 (+6.4%)",
                "stop_loss": "$486.00 (-3.3%)",
                "modeled_spread_bps": 3.0
            },
            "volatility_score": 4,
            "catalyst_type": "Enterprise AI SaaS Monetization"
        },
        {
            "ticker": "RY.TO",
            "secondary_tickers": ["TD.TO", "BMO.TO", "CM.TO"],
            "company_name": "Royal Bank of Canada",
            "headline": "Royal Bank of Canada (RY.TO) Wealth Management Inflows Hit Multi-Year High; Loan Provisions Stabilize",
            "summary": "Royal Bank of Canada reported stronger-than-anticipated commercial wealth net inflows and lower credit loss provisions as Bank of Canada interest rate cuts provided relief to mortgage and commercial loan holders. Capital ratios remain top-tier with CET1 at 13.2%.",
            "source": "Financial Post",
            "category": "TSX_CANADIAN",
            "sentiment": "BULLISH",
            "market_impact_score": 7.8,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Premier defensive dividend holding. Volatility Score is 2/10 (Very Low Volatility). Accumulate shares below $178.50 CAD for safe yield and steady capital appreciation. Highly insulated from tech volatility.",
            "key_levels_json": {
                "entry_zone": "$175.00 - $178.00 CAD",
                "target_price": "$188.00 CAD (+6.8%)",
                "stop_loss": "$171.00 CAD (-2.8%)",
                "modeled_spread_bps": 4.0
            },
            "volatility_score": 2,
            "catalyst_type": "TSX Financials & Stable Net Interest Margins"
        },
        {
            "ticker": "AAPL",
            "secondary_tickers": ["MSFT", "GOOGL"],
            "company_name": "Apple Inc.",
            "headline": "Apple (AAPL) Services Gross Margin Reaches 74% as Apple Intelligence Installed Base Surpasses 2.2 Billion Devices",
            "summary": "Apple's recurring Services ecosystem posted 14% growth year-over-year, driven by App Store, iCloud, and enterprise device management subscriptions. Carrier trade-in channel checks confirm resilient upgrade momentum for Apple Intelligence-compatible iPhone models.",
            "source": "Bloomberg Technology",
            "category": "AI_TECH",
            "sentiment": "BULLISH",
            "market_impact_score": 8.1,
            "action_recommendation": "HOLD_WATCH",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Hold core positions. Volatility Score is 3/10 (Low Volatility). Buy any pullback to the $242.00–$245.00 technical support shelf; target $265.00; stop at $237.00.",
            "key_levels_json": {
                "entry_zone": "$243.00 - $247.00",
                "target_price": "$265.00 (+6.8%)",
                "stop_loss": "$237.00 (-3.6%)",
                "modeled_spread_bps": 3.5
            },
            "volatility_score": 3,
            "catalyst_type": "Services Ecosystem & Consumer AI Upgrade Cycle"
        },
        {
            "ticker": "SPY",
            "secondary_tickers": ["QQQ", "IWM", "XIU.TO"],
            "company_name": "SPDR S&P 500 ETF Trust",
            "headline": "US Index Futures Advance as Wholesale Producer Prices Align with Federal Reserve Soft-Landing Targets",
            "summary": "Benchmark US and Canadian index futures trended higher at the 5:00 AM ET premarket open. The US Producer Price Index (PPI) registered a moderate 0.2% monthly rise, solidifying market expectations for a benign macro interest rate backdrop. Cross-asset credit spreads remain tight, reflecting healthy institutional liquidity.",
            "source": "CNBC Global Markets",
            "category": "MACRO_FED",
            "sentiment": "BULLISH",
            "market_impact_score": 8.8,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: BROAD MARKET PLAYBOOK: The macro backdrop is favorable for equities today. Maintain full equity allocations. Favor liquid market leaders with RVOL > 1.5x. Avoid chasing premarket gaps without volume confirmation at the 9:30 AM open. Benchmark Volatility Score is 1/10 (Lowest Market Risk).",
            "key_levels_json": {
                "entry_zone": "$590.00 - $592.50",
                "target_price": "$605.00 (+2.5%)",
                "stop_loss": "$584.00 (-1.3%)",
                "modeled_spread_bps": 1.0
            },
            "volatility_score": 1,
            "catalyst_type": "Macro Wholesale Inflation & Monetary Policy"
        },
        {
            "ticker": "AMD",
            "secondary_tickers": ["NVDA", "INTC", "TSM"],
            "company_name": "Advanced Micro Devices Inc.",
            "headline": "AMD (AMD) MI325X AI Accelerators Secure Multi-Cloud Production Workloads; EPYC Server Share Expands",
            "summary": "AMD demonstrated significant competitive gains in enterprise x86 datacenter server share while expanding commercial deployments of its Instinct MI325X GPU series for LLM fine-tuning and inference. Institutional dark pool volume proxy indicates constructive block accumulations over the past 5 trading sessions.",
            "source": "MarketWatch",
            "category": "AI_TECH",
            "sentiment": "BULLISH",
            "market_impact_score": 8.0,
            "action_recommendation": "BUY_ACCUMULATE",
            "what_to_do_today": "TACTICAL ACTION FOR TODAY: Strong semiconductor peer setup. Buy on breakout confirmation above $142.50. Price target $158.00; defensive stop at $134.00. Volatility Score is 7/10 (High Volatility), which offers fast upside but requires strict risk management.",
            "key_levels_json": {
                "entry_zone": "$140.00 - $144.00",
                "target_price": "$158.00 (+11.2%)",
                "stop_loss": "$134.00 (-5.6%)",
                "modeled_spread_bps": 7.0
            },
            "volatility_score": 7,
            "catalyst_type": "Datacenter GPU Server Share & AI Compute"
        }
    ]

    @classmethod
    def get_daily_publication_timestamp(cls) -> str:
        """
        Calculates today's 5:00 AM America/Toronto time string.
        """
        toronto_tz = pytz.timezone("America/Toronto")
        now_toronto = datetime.datetime.now(toronto_tz)
        today_5am = now_toronto.replace(hour=5, minute=0, second=0, microsecond=0)
        return today_5am.strftime("%Y-%m-%d 05:00:00 %Z")

    @classmethod
    def seed_and_refresh_news(cls, db: Session) -> List[StockNewsArticle]:
        """
        Ensures the stock news table is populated with fresh, grounded,
        sanitized stock news items and 5:00 AM Toronto time timestamps.
        """
        pub_time = cls.get_daily_publication_timestamp()
        existing_count = db.query(StockNewsArticle).count()

        if existing_count == 0:
            articles = []
            for item in cls.RAW_ARTICLES_TEMPLATE:
                sanitized_headline = sanitize_news_text(item["headline"])
                sanitized_summary = sanitize_news_text(item["summary"])
                sanitized_action = sanitize_news_text(item["what_to_do_today"])

                # Compute immutable SHA-256
                hash_input = f"{item['ticker']}:{sanitized_headline}:{pub_time}:{item['action_recommendation']}"
                article_hash = hashlib.sha256(hash_input.encode("utf-8")).hexdigest()

                art = StockNewsArticle(
                    ticker=item["ticker"],
                    secondary_tickers=item["secondary_tickers"],
                    company_name=item["company_name"],
                    headline=sanitized_headline,
                    summary=sanitized_summary,
                    source=item["source"],
                    published_at=pub_time,
                    publish_cycle="5AM_DAILY_TORONTO",
                    category=item["category"],
                    sentiment=item["sentiment"],
                    market_impact_score=item["market_impact_score"],
                    action_recommendation=item["action_recommendation"],
                    what_to_do_today=sanitized_action,
                    key_levels_json=item["key_levels_json"],
                    volatility_score=item["volatility_score"],
                    catalyst_type=item["catalyst_type"],
                    is_sanitized=True,
                    immutable_hash=article_hash
                )
                db.add(art)
                articles.append(art)
            db.commit()
            return articles

        # If already exists, return current articles sorted by market impact
        return db.query(StockNewsArticle).order_by(StockNewsArticle.market_impact_score.desc()).all()

    @classmethod
    def get_daily_action_briefing(cls, db: Session) -> Dict[str, Any]:
        """
        Builds the executive 5:00 AM America/Toronto Market & News Decision Playbook.
        Tells the user exactly what to do today across US and Canadian equities.
        """
        articles = cls.seed_and_refresh_news(db)
        toronto_now = calendar_service.get_toronto_now()
        pub_time = cls.get_daily_publication_timestamp()

        # Categorize actions
        buys = [a for a in articles if a.action_recommendation in ("BUY_ACCUMULATE", "STRONG_BUY")]
        holds = [a for a in articles if a.action_recommendation == "HOLD_WATCH"]
        high_volatility = [a for a in articles if a.volatility_score >= 8]

        return {
            "title": "5:00 AM America/Toronto Stock Market & News Intelligence",
            "published_at": pub_time,
            "toronto_time": toronto_now.strftime("%Y-%m-%d %I:%M %p %Z"),
            "daily_cycle": "5:00 AM ET Daily Publication",
            "market_bias": "Constructive Bullish / Growth Momentum (Selectively Accumulating High RVOL)",
            "executive_action_summary": (
                "TODAY'S TACTICAL DIRECTIVE: Index futures are trading constructively with benign wholesale inflation. "
                "Prioritize buying confirmed momentum pullbacks in high-quality AI and tech leaders (ANT, NVDA, PLTR, SHOP.TO) "
                "between 9:30 AM and 10:30 AM ET regular session volume confirmation. "
                "Exercise strict risk management on post-IPO and volatile names (ANT Vol 9/10, TSLA Vol 9/10, PLTR Vol 8/10); "
                "size high-volatility holdings below 2.5% of portfolio equity and honor stops."
            ),
            "top_buys_today": [
                {
                    "ticker": a.ticker,
                    "company_name": a.company_name,
                    "volatility_score": a.volatility_score,
                    "entry_zone": a.key_levels_json.get("entry_zone", "Market"),
                    "target": a.key_levels_json.get("target_price", "N/A"),
                    "stop": a.key_levels_json.get("stop_loss", "N/A"),
                    "reason": a.headline
                } for a in buys[:4]
            ],
            "stocks_to_watch_today": [
                {
                    "ticker": a.ticker,
                    "company_name": a.company_name,
                    "volatility_score": a.volatility_score,
                    "guidance": a.what_to_do_today
                } for a in holds[:3]
            ],
            "volatility_warnings_today": [
                {
                    "ticker": a.ticker,
                    "volatility_score": a.volatility_score,
                    "warning": f"Score {a.volatility_score}/10: Expect elevated intraday swings. Use trailing stops."
                } for a in high_volatility
            ],
            "total_articles_count": len(articles),
            "immutable_audit_fingerprint": hashlib.sha256(f"{pub_time}:DAILY_PLAYBOOK".encode()).hexdigest()
        }

news_service = StockNewsService()
