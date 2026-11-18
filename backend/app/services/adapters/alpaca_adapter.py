import asyncio
import datetime
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings
from app.services.security import redact_sensitive_string

class AlpacaAdapter:
    """
    Adapter for Alpaca Market Data v2 API with automatic retry,
    rate-limiting, and synthetic fallback when credentials are absent.
    """
    def __init__(self):
        self.api_key = settings.ALPACA_API_KEY
        self.secret_key = settings.ALPACA_SECRET_KEY
        self.base_url = "https://data.alpaca.markets/v2"
        self.is_configured = (
            bool(self.api_key) and 
            self.api_key != "ENTER_API_KEY_HERE" and 
            bool(self.secret_key) and 
            self.secret_key != "ENTER_API_KEY_HERE"
        )

    def _get_headers(self) -> Dict[str, str]:
        return {
            "APCA-API-KEY-ID": self.api_key or "",
            "APCA-API-SECRET-KEY": self.secret_key or "",
            "Accept": "application/json"
        }

    async def fetch_bars(
        self,
        symbol: str,
        timeframe: str = "1Day",
        limit: int = 60,
        retries: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Fetches historical bars for a given symbol from Alpaca Market Data v2.
        Includes exponential backoff retry for network or rate-limit errors.
        """
        if not self.is_configured:
            # Clean fallback to synthetic realistic feed
            return []

        url = f"{self.base_url}/stocks/{symbol}/bars"
        params = {
            "timeframe": timeframe,
            "limit": limit,
            "adjustment": "split",
            "feed": "sip"
        }

        delay = 0.5
        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(url, headers=self._get_headers(), params=params)
                    if response.status_code == 200:
                        data = response.json()
                        raw_bars = data.get("bars", [])
                        return [
                            {
                                "date": b["t"][:10],
                                "open": float(b["o"]),
                                "high": float(b["h"]),
                                "low": float(b["l"]),
                                "close": float(b["c"]),
                                "volume": float(b["v"]),
                                "vwap": float(b["vw"]) if "vw" in b else (float(b["h"]) + float(b["l"]) + float(b["c"])) / 3.0
                            }
                            for b in raw_bars
                        ]
                    elif response.status_code == 429:
                        # Rate limit: exponential backoff
                        await asyncio.sleep(delay)
                        delay *= 2
                    else:
                        break
            except Exception as e:
                clean_err = redact_sensitive_string(str(e))
                if attempt == retries - 1:
                    print(f"Alpaca API connection error for {symbol}: {clean_err}")
                await asyncio.sleep(delay)
                delay *= 2

        return []

    async def check_connection(self) -> bool:
        """Verifies if the credentials successfully authenticate with Alpaca."""
        if not self.is_configured:
            return False
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    "https://paper-api.alpaca.markets/v2/clock",
                    headers=self._get_headers()
                )
                return res.status_code == 200
        except Exception:
            return False
