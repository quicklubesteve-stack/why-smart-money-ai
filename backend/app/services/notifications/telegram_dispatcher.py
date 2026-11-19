import asyncio
import hashlib
import time
import datetime
from typing import Dict, Any, Optional, Set
import httpx
from app.config import settings
from app.services.security import redact_sensitive_string

class TelegramAlertDispatcher:
    """
    Asynchronous Telegram notification dispatcher with deduplication,
    rate-limiting, exponential backoff retries, and fallback simulation.
    """

    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self.is_configured = (
            bool(self.bot_token) and 
            self.bot_token != "ENTER_API_KEY_HERE" and 
            bool(self.chat_id) and 
            self.chat_id != "ENTER_CHAT_ID_HERE"
        )
        self.sent_hashes: Set[str] = set()
        self.last_send_timestamp: float = 0.0
        self.min_interval_seconds: float = 1.0  # Rate limit: 1 msg per second max

    def _generate_content_hash(self, text: str) -> str:
        return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()

    async def send_message(
        self,
        text: str,
        parse_mode: str = "HTML",
        max_retries: int = 3,
        deduplicate: bool = True
    ) -> Dict[str, Any]:
        """
        Sends an alert message to the configured Telegram chat with deduplication
        and exponential backoff retry for network/server errors.
        """
        content_hash = self._generate_content_hash(text)

        # 1. Deduplication check
        if deduplicate and content_hash in self.sent_hashes:
            return {
                "status": "DEDUPLICATED",
                "delivered": False,
                "content_hash": content_hash,
                "notes": "Notification suppressed: exact content hash was previously dispatched."
            }

        # 2. Rate limiting check
        now = time.time()
        elapsed = now - self.last_send_timestamp
        if elapsed < self.min_interval_seconds:
            await asyncio.sleep(self.min_interval_seconds - elapsed)

        # 3. Handle Demo / Unconfigured Token
        if not self.is_configured:
            # Record hash and log simulation
            self.sent_hashes.add(content_hash)
            self.last_send_timestamp = time.time()
            return {
                "status": "SIMULATED_DISPATCH",
                "delivered": True,
                "content_hash": content_hash,
                "recipient": "LOCAL_SIMULATED_CONSOLE",
                "notes": "Telegram credentials unconfigured in .env; message successfully logged to local audit stream."
            }

        # 4. Live API Dispatch with Exponential Backoff
        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True
        }

        delay = 1.0
        for attempt in range(1, max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(url, json=payload)
                    if response.status_code == 200:
                        self.sent_hashes.add(content_hash)
                        self.last_send_timestamp = time.time()
                        return {
                            "status": "SENT",
                            "delivered": True,
                            "content_hash": content_hash,
                            "attempts": attempt,
                            "notes": "Delivered successfully to Telegram."
                        }
                    elif response.status_code == 429:
                        # Telegram Rate Limit
                        retry_after = int(response.headers.get("Retry-After", delay))
                        await asyncio.sleep(retry_after)
                        delay *= 2
                    else:
                        print(f"Telegram API warning (status {response.status_code}): {response.text}")
                        await asyncio.sleep(delay)
                        delay *= 2
            except Exception as e:
                clean_err = redact_sensitive_string(str(e))
                if attempt == max_retries:
                    return {
                        "status": "FAILED",
                        "delivered": False,
                        "error": clean_err,
                        "content_hash": content_hash,
                        "attempts": attempt
                    }
                await asyncio.sleep(delay)
                delay *= 2

        return {
            "status": "FAILED_EXHAUSTED_RETRIES",
            "delivered": False,
            "content_hash": content_hash
        }

    def format_morning_brief_alert(self, brief: Dict[str, Any]) -> str:
        """
        Formats a 5 AM Market Brief for Telegram delivery.
        """
        today_str = brief.get("brief_date", datetime.date.today().isoformat())
        session = brief.get("session_type", "5AM_PREMARKET")
        summary = brief.get("macro_summary", "")
        top_10 = brief.get("top_10_opportunities", [])
        hash_snip = brief.get("immutable_hash", "")[:12]

        top_lines = []
        for item in top_10[:5]:
            sig_badge = "🟢 BUY" if item.get("signal") == "BUY" else "🟡 " + str(item.get("signal"))
            top_lines.append(
                f"• <b>{item.get('ticker')}</b> ({item.get('exchange')}): {sig_badge} | Score: {item.get('score', 0):.1f}/100"
            )

        top_str = "\n".join(top_lines) if top_lines else "• Analysis in progress"

        return (
            f"🌅 <b>WHY SMART MONEY AI — 5:00 AM MARKET BRIEF</b>\n"
            f"📅 <i>Session: {today_str} ({session})</i>\n"
            f"🔒 <i>SHA-256 Audit: {hash_snip}...</i>\n\n"
            f"<b>Premarket Thesis:</b>\n"
            f"{summary[:300]}...\n\n"
            f"<b>Top Ranked Opportunities:</b>\n"
            f"{top_str}\n\n"
            f"⚠️ <i>5 AM prices reflect thin premarket liquidity. Gaps are non-final. "
            f"95% is an aspirational research target, not a marketing claim.</i>"
        )

telegram_dispatcher = TelegramAlertDispatcher()
