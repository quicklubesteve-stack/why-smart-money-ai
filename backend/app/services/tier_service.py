from typing import Dict, Any, List

TIER_PLANS = {
    "FREE": {
        "id": "FREE",
        "name": "Explorer (Free)",
        "tagline": "Essential quantitative scanner & market intelligence",
        "monthly_price": 0,
        "annual_price": 0,
        "max_simulations": 100,
        "max_simulation_horizon_days": 20,
        "scanner_universe_limit": 5,
        "morning_brief_opportunities_limit": 3,
        "smart_money_details_enabled": False,
        "telegram_alerts_enabled": False,
        "paper_trading_daily_limit": 3,
        "features": [
            "Basic scanner (Top 5 liquid US/TSX stocks)",
            "100 Monte Carlo simulation runs",
            "5:00 AM Market Brief preview (Top 3 opportunities)",
            "Basic VWAP & RVOL indicators",
            "Simulated paper trading (up to 3 orders/day)",
            "Standard community support"
        ],
        "upgrade_cta": "Get Started Free"
    },
    "PRO": {
        "id": "PRO",
        "name": "Quantitative Trader (Pro)",
        "tagline": "Full institutional smart money intelligence & 2,000 simulations",
        "monthly_price": 49,
        "annual_price": 39,
        "max_simulations": 2000,
        "max_simulation_horizon_days": 90,
        "scanner_universe_limit": None,  # Unlimited
        "morning_brief_opportunities_limit": 10,
        "smart_money_details_enabled": True,
        "telegram_alerts_enabled": True,
        "paper_trading_daily_limit": None,  # Unlimited
        "popular": True,
        "features": [
            "2,000 Monte Carlo stochastic future paths",
            "Full US (NYSE/NASDAQ) & Canadian (TSX) scanner",
            "Full 5:00 AM Morning Market Brief (Top 10 + SHA256)",
            "Pre-open 9:15 AM signal refresh cycle",
            "Complete Dark Pool & FINRA off-exchange proxy breakdown",
            "SEC Form 13F institutional ownership flow tracker",
            "Calibrated ML walk-forward predictions (Platt Scaling)",
            "Automated Telegram morning alerts & risk warnings",
            "Unlimited paper trading with realistic slippage & spread",
            "Event-driven historical backtester simulator"
        ],
        "upgrade_cta": "Upgrade to Pro"
    },
    "INSTITUTIONAL": {
        "id": "INSTITUTIONAL",
        "name": "Institutional Enterprise",
        "tagline": "Dedicated quantitative infrastructure for hedge funds & family offices",
        "monthly_price": 199,
        "annual_price": 159,
        "max_simulations": 10000,
        "max_simulation_horizon_days": 252,
        "scanner_universe_limit": None,
        "morning_brief_opportunities_limit": 50,
        "smart_money_details_enabled": True,
        "telegram_alerts_enabled": True,
        "paper_trading_daily_limit": None,
        "features": [
            "10,000 high-frequency Monte Carlo simulation paths",
            "Multi-asset custom universe & watchlists",
            "Direct API access with high rate limits",
            "Custom purged walk-forward ML model hyperparameters",
            "Dedicated VPS deployment & backup replication",
            "Multi-seat team licenses & RBAC audit logging",
            "Dedicated quantitative researcher priority support"
        ],
        "upgrade_cta": "Contact Institutional Sales"
    }
}

class TierService:
    def __init__(self):
        # Default tier starts as FREE so user can experience both, or PRO if configured
        self._current_tier = "FREE"

    def get_current_tier(self) -> str:
        return self._current_tier

    def set_current_tier(self, tier: str) -> Dict[str, Any]:
        tier_upper = tier.upper()
        if tier_upper not in TIER_PLANS:
            raise ValueError(f"Invalid tier '{tier}'. Must be one of {list(TIER_PLANS.keys())}")
        self._current_tier = tier_upper
        return self.get_current_plan()

    def get_current_plan(self) -> Dict[str, Any]:
        plan = dict(TIER_PLANS[self._current_tier])
        plan["current_tier"] = self._current_tier
        return plan

    def get_all_plans(self) -> List[Dict[str, Any]]:
        result = []
        for plan_id, plan in TIER_PLANS.items():
            item = dict(plan)
            item["is_current"] = (plan_id == self._current_tier)
            result.append(item)
        return result

    def validate_simulation_limit(self, requested_simulations: int, horizon_days: int) -> Dict[str, Any]:
        plan = TIER_PLANS[self._current_tier]
        max_sims = plan["max_simulations"]
        max_horizon = plan["max_simulation_horizon_days"]

        is_allowed = True
        adjusted_sims = requested_simulations
        adjusted_horizon = horizon_days
        message = None

        if requested_simulations > max_sims:
            is_allowed = False
            adjusted_sims = max_sims
            message = (
                f"Your current {plan['name']} tier is capped at {max_sims} simulations. "
                f"Upgrade to PRO to run 2,000 multi-scenario future simulations."
            )

        if horizon_days > max_horizon:
            is_allowed = False
            adjusted_horizon = max_horizon
            message = (
                f"Your current {plan['name']} tier supports up to {max_horizon} simulation days. "
                f"Upgrade to PRO for up to 90 days of forward trajectory modeling."
            )

        return {
            "is_allowed": is_allowed,
            "current_tier": self._current_tier,
            "max_simulations": max_sims,
            "max_horizon": max_horizon,
            "adjusted_simulations": adjusted_sims,
            "adjusted_horizon": adjusted_horizon,
            "message": message
        }

tier_service = TierService()
