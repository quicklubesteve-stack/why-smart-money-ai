import numpy as np
import math
from typing import List, Dict, Any, Optional

class MonteCarloSimulationEngine:
    """
    Quantitative Monte Carlo Simulation Engine.
    Executes vectorized multi-path stochastic simulations (up to 2,000+ paths)
    modeling future asset price trajectories using Geometric Brownian Motion (GBM)
    with empirical drift, volatility, and optional Smart Money flow bias.
    """

    def run_simulation(
        self,
        current_price: float,
        historical_closes: List[float],
        num_simulations: int = 2000,
        horizon_days: int = 30,
        smart_money_score: float = 50.0,
        include_smart_money_bias: bool = True,
        target_price: Optional[float] = None,
        stop_loss: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes N price trajectory simulations over H trading days.
        """
        if len(historical_closes) < 10:
            # Fallback historical statistics if insufficient bars
            daily_returns = np.array([0.0005, -0.0003, 0.0012, 0.0008, -0.0007])
        else:
            closes = np.array(historical_closes)
            daily_returns = (closes[1:] - closes[:-1]) / closes[:-1]

        # Calculate empirical parameters
        mean_daily_return = float(np.mean(daily_returns))
        daily_volatility = float(np.std(daily_returns))
        if daily_volatility < 0.002:
            daily_volatility = 0.015  # baseline floor 1.5% daily vol

        # Institutional Smart Money Flow Adjustment:
        # Score > 50 gives slight positive drift bias; Score < 50 gives negative drift bias
        smart_money_drift_adj = 0.0
        if include_smart_money_bias:
            normalized_score = (smart_money_score - 50.0) / 50.0  # -1.0 to +1.0
            smart_money_drift_adj = normalized_score * 0.0008  # up to ~20 bps/day directional shift

        effective_drift = mean_daily_return + smart_money_drift_adj

        # Geometric Brownian Motion simulation:
        # S(t+dt) = S(t) * exp((mu - 0.5 * sigma^2)*dt + sigma * sqrt(dt) * Z)
        dt = 1.0
        drift_term = (effective_drift - 0.5 * (daily_volatility ** 2)) * dt
        vol_term = daily_volatility * math.sqrt(dt)

        np.random.seed(42)  # reproducible stochastic paths
        # Random shocks matrix: shape (num_simulations, horizon_days)
        z = np.random.normal(0, 1, size=(num_simulations, horizon_days))
        daily_multipliers = np.exp(drift_term + vol_term * z)

        # Prepend initial price column: S_0
        paths = np.empty((num_simulations, horizon_days + 1))
        paths[:, 0] = current_price

        for t in range(1, horizon_days + 1):
            paths[:, t] = paths[:, t - 1] * daily_multipliers[:, t - 1]

        # Terminal prices after horizon_days
        terminal_prices = paths[:, -1]
        terminal_returns = (terminal_prices - current_price) / current_price

        # Percentile trajectories over time (for fan chart visualization)
        percentiles = [5, 10, 25, 50, 75, 90, 95]
        percentile_curves = {}
        for p in percentiles:
            percentile_curves[f"p{p}"] = [
                round(float(val), 2) for val in np.percentile(paths, p, axis=0)
            ]

        # Target and Stop Loss hit rates
        prob_target_hit = 0.0
        prob_stop_hit = 0.0
        if target_price is not None and target_price > 0:
            # Max price reached along path >= target_price
            max_along_path = np.max(paths, axis=1)
            prob_target_hit = round(float(np.mean(max_along_path >= target_price)), 3)

        if stop_loss is not None and stop_loss > 0:
            # Min price reached along path <= stop_loss
            min_along_path = np.min(paths, axis=1)
            prob_stop_hit = round(float(np.mean(min_along_path <= stop_loss)), 3)

        # Probability of Profit (terminal price > initial price)
        prob_profit = round(float(np.mean(terminal_prices > current_price)), 3)

        # Value at Risk (VaR 95%) and Expected Shortfall (CVaR 95%)
        var_95_return = float(np.percentile(terminal_returns, 5))
        cvar_95_return = float(np.mean(terminal_returns[terminal_returns <= var_95_return]))
        var_95_price = round(current_price * (1.0 + var_95_return), 2)

        # Terminal distribution histogram buckets (15 bins)
        hist_counts, bin_edges = np.histogram(terminal_prices, bins=15)
        distribution_histogram = [
            {
                "bin_start": round(float(bin_edges[i]), 2),
                "bin_end": round(float(bin_edges[i + 1]), 2),
                "count": int(hist_counts[i]),
                "frequency_pct": round(float(hist_counts[i] / num_simulations * 100.0), 1)
            }
            for i in range(len(hist_counts))
        ]

        # Extract 20 sample paths for visual rendering in charts
        sample_path_indices = np.linspace(0, num_simulations - 1, min(20, num_simulations), dtype=int)
        sample_paths = [
            [round(float(p), 2) for p in paths[idx]]
            for idx in sample_path_indices
        ]

        return {
            "current_price": round(current_price, 2),
            "num_simulations": num_simulations,
            "horizon_days": horizon_days,
            "annualized_volatility_pct": round(daily_volatility * math.sqrt(252) * 100.0, 1),
            "effective_drift_daily_bps": round(effective_drift * 10000.0, 1),
            "smart_money_score": smart_money_score,
            "smart_money_bias_applied": include_smart_money_bias,
            "expected_terminal_price": round(float(np.mean(terminal_prices)), 2),
            "median_terminal_price": round(float(np.median(terminal_prices)), 2),
            "expected_return_pct": round(float(np.mean(terminal_returns) * 100.0), 2),
            "prob_profit": prob_profit,
            "target_price": target_price,
            "prob_target_hit": prob_target_hit,
            "stop_loss": stop_loss,
            "prob_stop_hit": prob_stop_hit,
            "var_95_price": var_95_price,
            "var_95_pct": round(var_95_return * 100.0, 2),
            "cvar_95_pct": round(cvar_95_return * 100.0, 2),
            "percentile_curves": percentile_curves,
            "distribution_histogram": distribution_histogram,
            "sample_paths": sample_paths
        }

simulation_engine = MonteCarloSimulationEngine()
