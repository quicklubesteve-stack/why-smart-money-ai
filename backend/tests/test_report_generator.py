import pytest
from app.database import SessionLocal
from app.services.report_generator import market_brief_generator

def test_market_brief_generator_sha256():
    db = SessionLocal()
    try:
        brief = market_brief_generator.generate_and_store_brief(
            db=db,
            session_type="5AM_PREMARKET",
            target_date="2026-11-20"
        )

        assert brief["brief_date"] == "2026-11-20"
        assert brief["session_type"] == "5AM_PREMARKET"
        assert "immutable_hash" in brief
        assert len(brief["immutable_hash"]) == 64  # SHA-256 hex string length
        assert len(brief["top_10_opportunities"]) > 0
        assert "LIQUIDITY NOTICE" in brief["macro_summary"]
    finally:
        db.close()
