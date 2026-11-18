from fastapi import APIRouter
from app.config import settings
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/providers", tags=["providers"])

class ProviderStatus(BaseModel):
    name: str
    category: str
    status: str
    mode: str
    notes: str

class ProvidersSummaryResponse(BaseModel):
    is_demo_mode: bool
    active_timezone: str
    providers: List[ProviderStatus]

@router.get("/status", response_model=ProvidersSummaryResponse)
def get_providers_status():
    alpaca_configured = settings.ALPACA_API_KEY and settings.ALPACA_API_KEY != "ENTER_API_KEY_HERE"
    massive_configured = settings.MASSIVE_API_KEY and settings.MASSIVE_API_KEY != "ENTER_API_KEY_HERE"
    news_configured = settings.NEWS_API_KEY and settings.NEWS_API_KEY != "ENTER_API_KEY_HERE"
    anthropic_configured = settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "ENTER_API_KEY_HERE"
    telegram_configured = settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_BOT_TOKEN != "ENTER_API_KEY_HERE"

    providers = [
        ProviderStatus(
            name="Alpaca Market Data & Brokerage",
            category="Market Data / Execution",
            status="CONNECTED" if alpaca_configured else "DEMO MODE",
            mode="Paper Trading" if settings.ALPACA_PAPER else "Live Trading (Disabled)",
            notes="Connected to live feed" if alpaca_configured else "Operating with synthetic realistic demo bars & internal paper broker simulation."
        ),
        ProviderStatus(
            name="Massive / Polygon Market Data",
            category="Institutional Feeds & Off-Exchange",
            status="CONNECTED" if massive_configured else "DEMO MODE",
            mode="Real-time Webhook / REST" if massive_configured else "Synthetic Feed",
            notes="US & Canadian tape authorized" if massive_configured else "Operating with simulated volume-price and off-exchange proxy metrics."
        ),
        ProviderStatus(
            name="Financial News Wire",
            category="Macro & News Sentiment",
            status="CONNECTED" if news_configured else "DEMO MODE",
            mode="Active Polling" if news_configured else "Curated Mock Wire",
            notes="Real-time RSS/API" if news_configured else "Grounded macro scenarios and catalyst headlines active."
        ),
        ProviderStatus(
            name="SEC EDGAR 13F & Regulatory",
            category="Institutional Ownership",
            status="ACTIVE",
            mode="Public API (Quarterly)",
            notes="Institutional ownership proxy analyzer active (delayed quarterly snapshots)."
        ),
        ProviderStatus(
            name="Anthropic Language Engine",
            category="Explainability / Synthesis",
            status="READY" if anthropic_configured else "TEMPLATE FALLBACK",
            mode="Direct API" if anthropic_configured else "Rule-based Grounded Explanations",
            notes="Synthesizes structured metrics into concise analytical notes."
        ),
        ProviderStatus(
            name="Telegram Alert Dispatcher",
            category="Scheduled 5 AM Notifications",
            status="ACTIVE" if telegram_configured else "DEMO / CONSOLE LOG",
            mode="Bot API" if telegram_configured else "Local Simulation",
            notes="Delivers morning report summaries and signal updates with rate-limiting and deduplication."
        )
    ]

    return ProvidersSummaryResponse(
        is_demo_mode=settings.is_demo_mode,
        active_timezone=settings.APP_TIMEZONE,
        providers=providers
    )
