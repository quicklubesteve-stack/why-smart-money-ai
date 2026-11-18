import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    APP_TIMEZONE: str = "America/Toronto"
    PORT: int = 8000
    DATABASE_URL: Optional[str] = None
    REDIS_URL: Optional[str] = None

    # Providers
    ALPACA_API_KEY: Optional[str] = "ENTER_API_KEY_HERE"
    ALPACA_SECRET_KEY: Optional[str] = "ENTER_API_KEY_HERE"
    ALPACA_PAPER: bool = True
    ALPACA_BASE_URL: str = "https://paper-api.alpaca.markets"

    MASSIVE_API_KEY: Optional[str] = "ENTER_API_KEY_HERE"
    NEWS_API_KEY: Optional[str] = "ENTER_API_KEY_HERE"
    ANTHROPIC_API_KEY: Optional[str] = "ENTER_API_KEY_HERE"
    TELEGRAM_BOT_TOKEN: Optional[str] = "ENTER_API_KEY_HERE"
    TELEGRAM_CHAT_ID: Optional[str] = "ENTER_CHAT_ID_HERE"

    # Risk Controls
    ENABLE_LIVE_TRADING: bool = False
    REQUIRE_EXPLICIT_CONFIRMATION: bool = True
    DEFAULT_MAX_POSITION_SIZE_PCT: float = 0.05
    DEFAULT_MAX_PORTFOLIO_RISK_PCT: float = 0.02
    MAX_SLIPPAGE_TOLERANCE_BPS: int = 15

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

    @property
    def is_demo_mode(self) -> bool:
        """Returns True if live/production market data providers are not configured."""
        is_alpaca_mock = not self.ALPACA_API_KEY or self.ALPACA_API_KEY == "ENTER_API_KEY_HERE"
        is_massive_mock = not self.MASSIVE_API_KEY or self.MASSIVE_API_KEY == "ENTER_API_KEY_HERE"
        return is_alpaca_mock or is_massive_mock

    @property
    def resolved_database_url(self) -> str:
        """Resolve database URL with automatic SQLite fallback for zero-friction local run."""
        url = self.DATABASE_URL
        if not url or url == "ENTER_DATABASE_URL_HERE":
            # Resolve to root-relative sqlite file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)
            db_path = os.path.join(backend_dir, "smart_money.db").replace("\\", "/")
            return f"sqlite:///{db_path}"
        return url

settings = Settings()
