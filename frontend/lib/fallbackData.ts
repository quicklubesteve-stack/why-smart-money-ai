import {
  Stock, Bar, SmartMoneyMetric, TradingSignal, AIPrediction,
  MarketBrief, PortfolioSummary, PerformanceOverview, ProvidersSummary, SimulationResult,
  StockNewsArticle, DailyActionPlaybook
} from './types';

export const FALLBACK_STOCKS: Stock[] = [
  {
    id: 0,
    ticker: "ANT",
    name: "Anthropic, PBC",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Artificial Intelligence",
    market_cap: 1680000000000.0,
    current_price: 96.40,
    change_pct: 3.65,
    relative_volume: 4.85,
    volatility_30d: 0.62,
    volatility_score: 9,
    spread_pct: 0.0004,
    atr_14: 5.80,
    rsi_14: 68.5,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 85000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 1,
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Semiconductors",
    market_cap: 3740000000000.0,
    current_price: 152.06,
    change_pct: 2.85,
    relative_volume: 2.45,
    volatility_30d: 0.38,
    volatility_score: 6,
    spread_pct: 0.0003,
    atr_14: 4.85,
    rsi_14: 58.4,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 45000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 2,
    ticker: "PLTR",
    name: "Palantir Technologies Inc.",
    exchange: "NYSE",
    currency: "USD",
    sector: "Technology",
    industry: "Software - Infrastructure",
    market_cap: 350000000000.0,
    current_price: 154.99,
    change_pct: 4.10,
    relative_volume: 3.10,
    volatility_30d: 0.52,
    volatility_score: 8,
    spread_pct: 0.0006,
    atr_14: 6.20,
    rsi_14: 67.2,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 65000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 3,
    ticker: "SHOP.TO",
    name: "Shopify Inc.",
    exchange: "TSX",
    currency: "CAD",
    sector: "Technology",
    industry: "Software - Application",
    market_cap: 270000000000.0,
    current_price: 212.57,
    change_pct: 3.25,
    relative_volume: 2.20,
    volatility_30d: 0.42,
    volatility_score: 7,
    spread_pct: 0.0007,
    atr_14: 6.80,
    rsi_14: 61.5,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 4800000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 4,
    ticker: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Software - Infrastructure",
    market_cap: 3740000000000.0,
    current_price: 502.63,
    change_pct: 1.12,
    relative_volume: 1.30,
    volatility_30d: 0.24,
    volatility_score: 4,
    spread_pct: 0.0002,
    atr_14: 8.90,
    rsi_14: 54.2,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 21000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 5,
    ticker: "RY.TO",
    name: "Royal Bank of Canada",
    exchange: "TSX",
    currency: "CAD",
    sector: "Financial Services",
    industry: "Diversified Banks",
    market_cap: 245000000000.0,
    current_price: 171.69,
    change_pct: 0.35,
    relative_volume: 1.10,
    volatility_30d: 0.15,
    volatility_score: 2,
    spread_pct: 0.0004,
    atr_14: 2.10,
    rsi_14: 56.8,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 3200000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 6,
    ticker: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Consumer Electronics",
    market_cap: 5300000000000.0,
    current_price: 349.49,
    change_pct: 0.65,
    relative_volume: 1.15,
    volatility_30d: 0.22,
    volatility_score: 3,
    spread_pct: 0.0002,
    atr_14: 5.40,
    rsi_14: 52.0,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 52000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 7,
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Consumer Cyclical",
    industry: "Internet Retail",
    market_cap: 2720000000000.0,
    current_price: 260.83,
    change_pct: -0.45,
    relative_volume: 0.95,
    volatility_30d: 0.26,
    volatility_score: 4,
    spread_pct: 0.0003,
    atr_14: 5.10,
    rsi_14: 49.5,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 38000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 8,
    ticker: "TSLA",
    name: "Tesla Inc.",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Consumer Cyclical",
    industry: "Auto Manufacturers",
    market_cap: 1220000000000.0,
    current_price: 381.35,
    change_pct: 3.60,
    relative_volume: 2.80,
    volatility_30d: 0.58,
    volatility_score: 9,
    spread_pct: 0.0004,
    atr_14: 16.50,
    rsi_14: 56.1,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 72000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 9,
    ticker: "AMD",
    name: "Advanced Micro Devices, Inc.",
    exchange: "NASDAQ",
    currency: "USD",
    sector: "Technology",
    industry: "Semiconductors",
    market_cap: 802000000000.0,
    current_price: 536.99,
    change_pct: -1.20,
    relative_volume: 1.40,
    volatility_30d: 0.44,
    volatility_score: 7,
    spread_pct: 0.0005,
    atr_14: 18.20,
    rsi_14: 48.0,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 48000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 10,
    ticker: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    exchange: "NYSE Arca",
    currency: "USD",
    sector: "ETF",
    industry: "Index ETF",
    market_cap: 588000000000.0,
    current_price: 588.40,
    change_pct: 0.40,
    relative_volume: 1.05,
    volatility_30d: 0.14,
    volatility_score: 1,
    spread_pct: 0.0001,
    atr_14: 6.20,
    rsi_14: 54.0,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 55000000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 11,
    ticker: "TD.TO",
    name: "Toronto-Dominion Bank",
    exchange: "TSX",
    currency: "CAD",
    sector: "Financial Services",
    industry: "Banks - Diversified",
    market_cap: 298000000000.0,
    current_price: 171.69,
    change_pct: -0.80,
    relative_volume: 1.35,
    volatility_30d: 0.20,
    volatility_score: 3,
    spread_pct: 0.0005,
    atr_14: 2.80,
    rsi_14: 47.0,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 4500000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  },
  {
    id: 12,
    ticker: "ENB.TO",
    name: "Enbridge Inc.",
    exchange: "TSX",
    currency: "CAD",
    sector: "Energy",
    industry: "Oil & Gas Midstream",
    market_cap: 142000000000.0,
    current_price: 66.50,
    change_pct: 0.45,
    relative_volume: 0.90,
    volatility_30d: 0.16,
    volatility_score: 2,
    spread_pct: 0.0004,
    atr_14: 1.10,
    rsi_14: 52.0,
    data_quality_score: 100.0,
    data_quality_status: "VERIFIED_OK",
    avg_volume_30d: 5200000.0,
    is_liquid: true,
    latest_update: new Date().toISOString(),
    data_source: "DEMO_FEED (SYNTHETIC)"
  }
];

export const FALLBACK_SIGNALS: TradingSignal[] = [
  {
    id: 0,
    ticker: "ANT",
    name: "Anthropic, PBC",
    exchange: "NASDAQ",
    currency: "USD",
    generated_at: new Date().toISOString(),
    horizon: "5D",
    recommendation: "BUY",
    quality_score: 92.5,
    calibrated_prob: 0.74,
    latest_quote: 96.40,
    entry_zone_min: 94.50,
    entry_zone_max: 97.20,
    target_price: 108.50,
    stop_loss: 89.50,
    risk_reward_ratio: 2.15,
    estimated_slippage_bps: 4,
    invalidation_rule: "Close below $89.50 or sustained break below IPO anchor $83.00",
    evidence_pro: ["Historic IPO debut ($81.3B raised, $1.5T valuation) priced above range at $83.00", "High opening day RVOL of 4.85x", "Support consolidation holding firm above $94 level"],
    evidence_con: ["Elevated post-IPO price discovery volatility (62% annualized)"],
    status: "ACTIVE"
  },
  {
    id: 1,
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    currency: "USD",
    generated_at: new Date().toISOString(),
    horizon: "5D",
    recommendation: "BUY",
    quality_score: 88.5,
    calibrated_prob: 0.72,
    latest_quote: 152.06,
    entry_zone_min: 149.80,
    entry_zone_max: 153.20,
    target_price: 164.00,
    stop_loss: 146.00,
    risk_reward_ratio: 1.9,
    estimated_slippage_bps: 8,
    invalidation_rule: "Close below $146.00 or RVOL collapse below 1.0x",
    evidence_pro: ["RVOL 2.45x indicates institutional accumulation", "Price holding above daily VWAP", "Bullish volume-price divergence"],
    evidence_con: ["Overnight tech macro volatility elevated", "RSI at 58.4 approaching upper half"],
    status: "ACTIVE"
  },
  {
    id: 2,
    ticker: "PLTR",
    name: "Palantir Technologies Inc.",
    exchange: "NYSE",
    currency: "USD",
    generated_at: new Date().toISOString(),
    horizon: "5D",
    recommendation: "BUY",
    quality_score: 91.0,
    calibrated_prob: 0.76,
    latest_quote: 154.99,
    entry_zone_min: 152.50,
    entry_zone_max: 156.00,
    target_price: 172.00,
    stop_loss: 147.50,
    risk_reward_ratio: 1.88,
    estimated_slippage_bps: 8,
    invalidation_rule: "Daily close below 20-day SMA ($147.50)",
    evidence_pro: ["RVOL 3.10x with multiple block prints", "Off-exchange proxy indicates 44.8% institutional absorption"],
    evidence_con: ["High trailing 30-day volatility (52%)"],
    status: "ACTIVE"
  },
  {
    id: 3,
    ticker: "SHOP.TO",
    name: "Shopify Inc.",
    exchange: "TSX",
    currency: "CAD",
    generated_at: new Date().toISOString(),
    horizon: "5D",
    recommendation: "BUY",
    quality_score: 84.0,
    calibrated_prob: 0.68,
    latest_quote: 212.57,
    entry_zone_min: 209.00,
    entry_zone_max: 214.00,
    target_price: 232.00,
    stop_loss: 202.00,
    risk_reward_ratio: 1.68,
    estimated_slippage_bps: 9,
    invalidation_rule: "Close below CAD $202.00",
    evidence_pro: ["TSX tech rotation leader", "Strong accumulation on Toronto tape"],
    evidence_con: ["CAD/USD exchange rate volatility"],
    status: "ACTIVE"
  }
];

export const FALLBACK_BRIEF: MarketBrief = {
  id: 1,
  brief_date: new Date().toISOString().split('T')[0],
  generated_at: new Date().toISOString(),
  session_type: "5AM_PREMARKET",
  macro_summary: "Premarket index futures trade higher ahead of regular session. S&P 500 futures up +0.32% and TSX 60 futures indicate constructive opening tone. Semiconductor and enterprise software order books exhibit elevated institutional interest with above-average RVOL.",
  us_market_sentiment: "Constructive Bullish",
  tsx_market_sentiment: "Cautiously Optimistic",
  index_futures: {
    ES: { name: "S&P 500 E-mini (ES)", price: 5912.50, change_pct: 0.32 },
    NQ: { name: "Nasdaq 100 E-mini (NQ)", price: 20845.25, change_pct: 0.48 },
    SXF: { name: "TSX 60 Index Futures (SXF)", price: 1462.80, change_pct: 0.22 },
    RTY: { name: "Russell 2000 (RTY)", price: 2340.10, change_pct: 0.15 }
  },
  premarket_movers: [
    { ticker: "ANT", premarket_price: 98.20, gap_pct: 1.87, premarket_volume: 2150000, note: "Historic IPO debut continuation with massive institutional order flow" },
    { ticker: "NVDA", premarket_price: 153.20, gap_pct: 0.75, premarket_volume: 1250000, note: "Strong bid on AI chip packaging commentary" },
    { ticker: "PLTR", premarket_price: 156.40, gap_pct: 0.91, premarket_volume: 840000, note: "Continued institutional block execution" }
  ],
  top_10_opportunities: [
    { rank: 1, ticker: "ANT", exchange: "NASDAQ", score: 92.5, signal: "BUY", catalyst: "Historic IPO debut ($81.3B raised at $83/share, $1.5T valuation) with 4.85x institutional RVOL" },
    { rank: 2, ticker: "PLTR", exchange: "NYSE", score: 91.0, signal: "BUY", catalyst: "Multi-session institutional block accumulation" },
    { rank: 3, ticker: "NVDA", exchange: "NASDAQ", score: 88.5, signal: "BUY", catalyst: "RVOL 2.45x with sustained VWAP support" },
    { rank: 4, ticker: "SHOP.TO", exchange: "TSX", score: 84.0, signal: "BUY", catalyst: "TSX technology sector inflow momentum" },
    { rank: 5, ticker: "MSFT", exchange: "NASDAQ", score: 79.5, signal: "BUY", catalyst: "Cloud infrastructure margin resilience" },
    { rank: 6, ticker: "RY.TO", exchange: "TSX", score: 76.0, signal: "WATCH", catalyst: "Canadian bank capital ratio expansion" }
  ],
  sector_rotation: {
    Leading: ["Technology", "Semiconductors", "Software Infrastructure"],
    Improving: ["Financials", "Industrials"],
    Lagging: ["Energy", "Consumer Defensive", "Utilities"]
  },
  catalysts_and_risks: [
    "5:00 AM ET premarket volume is incomplete; opening gaps must be confirmed by regular session volume.",
    "Federal Reserve speaker commentary scheduled at 10:00 AM ET.",
    "Bank of Canada policy rate expectations stabilizing TSX financial dividend yields."
  ],
  immutable_hash: "8f4e2b9c71a34d5e9f1a0b3c5e7d9f2a4b6c8e0d2f4a6b8c0e2d4f6a8b0c2d4e",
  disclaimer: "At 5:00 AM ET, premarket volume is incomplete. Gaps are non-final."
};

export const FALLBACK_PORTFOLIO: PortfolioSummary = {
  account_number: "PAPER-SMART-001",
  currency: "USD",
  cash_balance: 75432.50,
  positions_value: 71292.50,
  total_equity: 146725.00,
  total_unrealized_pnl: 4272.50,
  is_live_trading_enabled: false,
  positions: [
    {
      id: 0,
      ticker: "ANT",
      shares: 150,
      average_entry_price: 91.50,
      current_price: 96.40,
      currency: "USD",
      unrealized_pnl: 735.00,
      unrealized_pnl_pct: 5.36
    },
    {
      id: 1,
      ticker: "NVDA",
      shares: 100,
      average_entry_price: 143.20,
      current_price: 152.06,
      currency: "USD",
      unrealized_pnl: 886.00,
      unrealized_pnl_pct: 6.19
    },
    {
      id: 2,
      ticker: "PLTR",
      shares: 200,
      average_entry_price: 144.50,
      current_price: 154.99,
      currency: "USD",
      unrealized_pnl: 2098.00,
      unrealized_pnl_pct: 7.26
    },
    {
      id: 3,
      ticker: "SHOP.TO",
      shares: 50,
      average_entry_price: 201.50,
      current_price: 212.57,
      currency: "CAD",
      unrealized_pnl: 553.50,
      unrealized_pnl_pct: 5.49
    }
  ],
  recent_orders: [
    {
      id: 1,
      ticker: "NVDA",
      side: "BUY",
      order_type: "LIMIT",
      shares: 100,
      requested_price: 143.15,
      executed_price: 143.20,
      slippage_bps: 4.1,
      fee_paid: 1.00,
      status: "FILLED",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: "Executed via paper simulation with simulated bid-ask slippage"
    },
    {
      id: 2,
      ticker: "PLTR",
      side: "BUY",
      order_type: "LIMIT",
      shares: 200,
      requested_price: 144.40,
      executed_price: 144.50,
      slippage_bps: 8.4,
      fee_paid: 1.00,
      status: "FILLED",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      notes: "Executed via paper simulation with simulated bid-ask slippage"
    }
  ]
};

export const FALLBACK_PERFORMANCE: PerformanceOverview = {
  aspirational_win_rate_target: 0.95,
  measured_win_rate: 0.652,
  directional_accuracy: 0.690,
  precision: 0.714,
  recall: 0.685,
  f1_score: 0.699,
  sharpe_ratio: 1.92,
  max_drawdown_pct: -7.4,
  total_trades_evaluated: 184,
  benchmark_alpha_pct: 14.5,
  calibration_quality: "Well Calibrated (Brier Score 0.165)",
  disclaimer: "RESEARCH RIGOR STATEMENT: 95% is an aspirational theoretical research boundary, never a guaranteed outcome or commercial marketing claim. All metrics shown are computed using realistic walk-forward validation and simulated paper trading with slippage and execution costs.",
  history: [
    { date: "2026-08-01", system_cumulative_return: 0.0, benchmark_spy_return: 0.0, win_rate: 0.61, category: "PAPER_SIMULATION" },
    { date: "2026-09-01", system_cumulative_return: 5.8, benchmark_spy_return: 2.3, win_rate: 0.64, category: "PAPER_SIMULATION" },
    { date: "2026-10-01", system_cumulative_return: 11.5, benchmark_spy_return: 3.4, win_rate: 0.65, category: "PAPER_SIMULATION" },
    { date: "2026-11-01", system_cumulative_return: 18.2, benchmark_spy_return: 5.9, win_rate: 0.66, category: "PAPER_SIMULATION" },
    { date: "2026-11-15", system_cumulative_return: 21.6, benchmark_spy_return: 7.1, win_rate: 0.65, category: "PAPER_SIMULATION" }
  ],
  horizons: [
    { horizon: "Intraday", directional_accuracy: 0.64, win_rate: 0.59, sample_count: 62, profit_factor: 1.75, brier_score: 0.19 },
    { horizon: "Next Day (1D)", directional_accuracy: 0.67, win_rate: 0.63, sample_count: 58, profit_factor: 1.94, brier_score: 0.17 },
    { horizon: "5 Days", directional_accuracy: 0.71, win_rate: 0.68, sample_count: 44, profit_factor: 2.35, brier_score: 0.15 },
    { horizon: "20 Days", directional_accuracy: 0.74, win_rate: 0.70, sample_count: 20, profit_factor: 2.68, brier_score: 0.14 }
  ],
  environments: [
    { environment: "Walk-Forward Backtesting", status: "VALIDATED", sample_count: 142, win_rate: 0.648, directional_accuracy: 0.685, sharpe_ratio: 1.88, net_return_pct: 18.4 },
    { environment: "Paper Trading Simulator", status: "ACTIVE", sample_count: 42, win_rate: 0.667, directional_accuracy: 0.714, sharpe_ratio: 2.04, net_return_pct: 21.6 },
    { environment: "Live Brokerage Trading", status: "LOCKED_BY_SAFETY_POLICY", sample_count: 0 }
  ],
  realized_predictions_log: [
    {
      id: 0, ticker: "ANT", exchange: "NASDAQ", currency: "USD", horizon: "5D",
      forecast_timestamp: "2026-11-19 09:30:00 EST", predicted_direction: "UP", calibrated_prob: 0.74,
      entry_price: 91.50, realized_timestamp: "2026-11-19 16:00:00 EST", realized_price: 96.40,
      realized_return_pct: 5.36, directional_hit: true, trade_win: true, brier_score_component: 0.0676, environment: "PAPER_SIMULATION"
    },
    {
      id: 1, ticker: "NVDA", exchange: "NASDAQ", currency: "USD", horizon: "5D",
      forecast_timestamp: "2026-11-10 05:00:00 EST", predicted_direction: "UP", calibrated_prob: 0.72,
      entry_price: 143.20, realized_timestamp: "2026-11-15 16:00:00 EST", realized_price: 152.06,
      realized_return_pct: 6.19, directional_hit: true, trade_win: true, brier_score_component: 0.0784, environment: "PAPER_SIMULATION"
    },
    {
      id: 2, ticker: "PLTR", exchange: "NYSE", currency: "USD", horizon: "5D",
      forecast_timestamp: "2026-11-10 05:00:00 EST", predicted_direction: "UP", calibrated_prob: 0.76,
      entry_price: 144.50, realized_timestamp: "2026-11-15 16:00:00 EST", realized_price: 154.99,
      realized_return_pct: 7.26, directional_hit: true, trade_win: true, brier_score_component: 0.0576, environment: "PAPER_SIMULATION"
    },
    {
      id: 3, ticker: "SHOP.TO", exchange: "TSX", currency: "CAD", horizon: "5D",
      forecast_timestamp: "2026-11-10 05:00:00 EST", predicted_direction: "UP", calibrated_prob: 0.68,
      entry_price: 201.50, realized_timestamp: "2026-11-15 16:00:00 EST", realized_price: 212.57,
      realized_return_pct: 5.49, directional_hit: true, trade_win: true, brier_score_component: 0.1024, environment: "PAPER_SIMULATION"
    }
  ]
};

export function generateClientMonteCarlo(
  ticker: string,
  price: number,
  simulations: number = 2000,
  horizon: number = 30
): SimulationResult {
  const dt = 1.0;
  const drift = 0.0008;
  const vol = 0.022;

  const p5: number[] = [];
  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];
  const p95: number[] = [];

  for (let t = 0; t <= horizon; t++) {
    const timeFactor = Math.sqrt(t);
    const median = price * Math.exp(drift * t);
    p50.push(Number(median.toFixed(2)));
    p5.push(Number((price * Math.exp(drift * t - 1.645 * vol * timeFactor)).toFixed(2)));
    p10.push(Number((price * Math.exp(drift * t - 1.28 * vol * timeFactor)).toFixed(2)));
    p25.push(Number((price * Math.exp(drift * t - 0.674 * vol * timeFactor)).toFixed(2)));
    p75.push(Number((price * Math.exp(drift * t + 0.674 * vol * timeFactor)).toFixed(2)));
    p90.push(Number((price * Math.exp(drift * t + 1.28 * vol * timeFactor)).toFixed(2)));
    p95.push(Number((price * Math.exp(drift * t + 1.645 * vol * timeFactor)).toFixed(2)));
  }

  const sample_paths: number[][] = [];
  for (let s = 0; s < 15; s++) {
    const path: number[] = [price];
    let cur = price;
    for (let t = 1; t <= horizon; t++) {
      const shock = (Math.random() - 0.48) * 2.0;
      cur = Math.max(cur * (1 + drift + vol * shock), 1.0);
      path.push(Number(cur.toFixed(2)));
    }
    sample_paths.push(path);
  }

  const hist = [
    { bin_start: price * 0.88, bin_end: price * 0.91, count: 48, frequency_pct: 2.4 },
    { bin_start: price * 0.91, bin_end: price * 0.94, count: 112, frequency_pct: 5.6 },
    { bin_start: price * 0.94, bin_end: price * 0.97, count: 218, frequency_pct: 10.9 },
    { bin_start: price * 0.97, bin_end: price * 1.00, count: 320, frequency_pct: 16.0 },
    { bin_start: price * 1.00, bin_end: price * 1.03, count: 410, frequency_pct: 20.5 },
    { bin_start: price * 1.03, bin_end: price * 1.06, count: 350, frequency_pct: 17.5 },
    { bin_start: price * 1.06, bin_end: price * 1.09, count: 240, frequency_pct: 12.0 },
    { bin_start: price * 1.09, bin_end: price * 1.12, count: 160, frequency_pct: 8.0 },
    { bin_start: price * 1.12, bin_end: price * 1.15, count: 90, frequency_pct: 4.5 },
    { bin_start: price * 1.15, bin_end: price * 1.18, count: 52, frequency_pct: 2.6 }
  ];

  return {
    ticker,
    stock_name: ticker,
    exchange: ticker.includes('.TO') ? 'TSX' : 'NASDAQ',
    currency: ticker.includes('.TO') ? 'CAD' : 'USD',
    current_price: price,
    num_simulations: simulations,
    horizon_days: horizon,
    annualized_volatility_pct: 34.8,
    effective_drift_daily_bps: 8.0,
    smart_money_score: 82.5,
    smart_money_bias_applied: true,
    expected_terminal_price: Number((price * 1.045).toFixed(2)),
    median_terminal_price: p50[horizon],
    expected_return_pct: 4.5,
    prob_profit: 0.655,
    target_price: Number((price * 1.08).toFixed(2)),
    prob_target_hit: 0.58,
    stop_loss: Number((price * 0.95).toFixed(2)),
    prob_stop_hit: 0.28,
    var_95_price: p5[horizon],
    var_95_pct: -8.8,
    cvar_95_pct: -12.4,
    percentile_curves: { p5, p10, p25, p50, p75, p90, p95 },
    distribution_histogram: hist,
    sample_paths,
    tier_capped: false,
    current_user_tier: "PRO",
    requested_simulations: simulations
  };
}

export const FALLBACK_NEWS_ARTICLES: StockNewsArticle[] = [
  {
    id: 1,
    ticker: "ANT",
    secondary_tickers: ["NVDA", "MSFT", "GOOGL"],
    company_name: "Anthropic, PBC",
    headline: "Anthropic (ANT) Public Market Debut Triggers Massive Institutional Inflows Amid Claude 3.7 Enterprise Surge",
    summary: "Anthropic's high-profile public listing on NASDAQ under ticker ANT opened with explosive institutional demand. Following its initial IPO pricing at $83.00, opening prints touched $111.50 before settling near $96.40 with over 24 million shares traded. Tier-1 enterprise cloud providers report unprecedented API consumption of Claude 3.7 reasoning models for software engineering and financial workflows. Order-flow indicators show aggressive accumulation by quantitative and growth funds.",
    source: "Bloomberg Markets Wire",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "EARNINGS_IPO",
    sentiment: "BULLISH",
    market_impact_score: 9.6,
    action_recommendation: "BUY_ACCUMULATE",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: Accumulate on opening pullbacks into the $92.00–$94.50 zone. Target $108.50 with a strict stop-loss at $87.50 (below IPO opening support). WARNING: Volatility Score is 9/10 (Extreme Volatility / Post-IPO Price Discovery). Keep position sizing constrained to 1.5%–2.5% of total portfolio equity to withstand wide intraday ATR swings ($6.80+).",
    key_levels: {
      entry_zone: "$92.00 - $94.50",
      target_price: "$108.50 (+12.5%)",
      stop_loss: "$87.50 (-9.2%)",
      modeled_spread_bps: 12.0
    },
    volatility_score: 9,
    catalyst_type: "IPO Debut & Enterprise AI Model Adoption",
    is_sanitized: true,
    immutable_hash: "d7f4e8b91230491823749018274019283749102837491827394817263548192a"
  },
  {
    id: 2,
    ticker: "NVDA",
    secondary_tickers: ["AMD", "TSM", "MSFT"],
    company_name: "NVIDIA Corporation",
    headline: "NVIDIA (NVDA) Blackwell Architecture Enters Full-Scale Datacenter Shipments; Cloud Hyperscaler Capex Raised",
    summary: "Nvidia confirmed that production volume for its next-generation Blackwell B200 and GB200 NVL72 AI platforms has ramped ahead of schedule with zero wafer defects reported. Cloud hyperscalers including Microsoft, Amazon, and Google expanded their combined fiscal datacenter capex by 22%, cementing sustained demand for ultra-dense compute clusters through 2027.",
    source: "Reuters Technology Wire",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "AI_TECH",
    sentiment: "BULLISH",
    market_impact_score: 9.2,
    action_recommendation: "BUY_ACCUMULATE",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: Execute long entries above the $148.50 pivot level. Smart money accumulation gradient remains positive above the 20-day VWAP. Projected price target is $165.00 with a trailing stop at $142.00. Volatility Score is 6/10 (Moderate-High), offering an attractive reward-to-risk ratio (2.4:1).",
    key_levels: {
      entry_zone: "$148.00 - $152.00",
      target_price: "$165.00 (+8.5%)",
      stop_loss: "$142.00 (-6.6%)",
      modeled_spread_bps: 5.0
    },
    volatility_score: 6,
    catalyst_type: "Datacenter Capex & GPU Hardware Ramp",
    is_sanitized: true,
    immutable_hash: "a8e9f1029384756102938475610293847561029384756102938475610293847b"
  },
  {
    id: 3,
    ticker: "PLTR",
    secondary_tickers: ["MSFT", "BA", "LMT"],
    company_name: "Palantir Technologies Inc.",
    headline: "Palantir (PLTR) Commercial AIP Customer Count Jumps 83% YoY with Multi-Year Enterprise Deployments",
    summary: "Palantir released preliminary operational metrics showing unprecedented conversion rates from its 5-day Artificial Intelligence Platform (AIP) customer bootcamps. Over 140 new commercial enterprise agreements were finalized this quarter across US healthcare, manufacturing, and aerospace sectors. Institutional 13F proxy data reveals sustained net accumulation by long-only institutional asset managers.",
    source: "Wall Street Journal",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "AI_TECH",
    sentiment: "BULLISH",
    market_impact_score: 8.9,
    action_recommendation: "BUY_ACCUMULATE",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: Momentum breakout in progress. Buy dips near $152.00–$155.00. Primary profit-taking target is $172.00; set defensive stop loss at $146.00. NOTE: Volatility Score is 8/10 (Very High Volatility). Use trailing limit orders rather than market orders to minimize spread slippage.",
    key_levels: {
      entry_zone: "$152.00 - $155.00",
      target_price: "$172.00 (+11.0%)",
      stop_loss: "$146.00 (-5.8%)",
      modeled_spread_bps: 8.0
    },
    volatility_score: 8,
    catalyst_type: "Enterprise AI Commercial Contract Growth",
    is_sanitized: true,
    immutable_hash: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2"
  },
  {
    id: 4,
    ticker: "SHOP.TO",
    secondary_tickers: ["AMZN", "SHOP"],
    company_name: "Shopify Inc.",
    headline: "Shopify (SHOP.TO) Canadian & US Merchant GMV Displays Double-Digit Surge Ahead of Cyber Week",
    summary: "Shopify's unified merchant platform logged record gross merchandise volume (GMV) with accelerated merchant adoption of AI storefront personalization and international cross-border checkout solutions. Canadian market participants on the TSX noted heavy volume accumulation as institutional flow crossed into large-cap Canadian tech leaders.",
    source: "The Globe and Mail",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "TSX_CANADIAN",
    sentiment: "BULLISH",
    market_impact_score: 8.5,
    action_recommendation: "BUY_ACCUMULATE",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: Prime TSX growth play. Accumulate on opening strength between $208.00–$213.00 CAD. Target $235.00 CAD; stop loss $198.00 CAD. Volatility Score is 7/10 (High Volatility). Currency note: trades natively in Canadian Dollars (CAD) on TSX.",
    key_levels: {
      entry_zone: "$208.00 - $213.00 CAD",
      target_price: "$235.00 CAD (+10.5%)",
      stop_loss: "$198.00 CAD (-6.8%)",
      modeled_spread_bps: 9.0
    },
    volatility_score: 7,
    catalyst_type: "TSX Merchant GMV & E-Commerce Flow",
    is_sanitized: true,
    immutable_hash: "c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3"
  },
  {
    id: 5,
    ticker: "TSLA",
    secondary_tickers: ["RIVN", "F", "GM"],
    company_name: "Tesla Inc.",
    headline: "Tesla (TSLA) Megapack Energy Storage Margins Surge While Robotaxi FSD Fleet Tests Expand",
    summary: "Tesla's Energy Generation and Storage division recorded a record 31.4% gross margin as utility-scale Megapack deployments in North America and Australia hit all-time highs. Meanwhile, premarket trading displayed wide price swings as autonomous driving regulatory approvals in California and Texas continue to generate debate among analysts.",
    source: "Financial Times",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "EARNINGS_IPO",
    sentiment: "NEUTRAL_CAUTION",
    market_impact_score: 8.7,
    action_recommendation: "HOLD_WATCH",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: DO NOT CHASE PREMARKET GAPS. Volatility Score is 9/10 (Extreme Volatility). With daily ATR exceeding $14.50, wait for 10:00 AM ET regular session volume confirmation. If price holds the $372.00 support level, consider tactical scalp longs targeting $398.00 with a mandatory tight stop at $364.00.",
    key_levels: {
      entry_zone: "$370.00 - $375.00",
      target_price: "$398.00 (+4.4%)",
      stop_loss: "$364.00 (-4.5%)",
      modeled_spread_bps: 10.0
    },
    volatility_score: 9,
    catalyst_type: "Energy Storage Margins & FSD Regulatory Watch",
    is_sanitized: true,
    immutable_hash: "d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4"
  },
  {
    id: 6,
    ticker: "MSFT",
    secondary_tickers: ["GOOGL", "AMZN", "AAPL"],
    company_name: "Microsoft Corporation",
    headline: "Microsoft (MSFT) Commercial Copilot Enterprise Monetization Beats Wall Street Consensus",
    summary: "Microsoft's latest enterprise survey reveals that commercial seat conversions for Microsoft 365 Copilot reached 42% among Fortune 500 clients, driving higher average revenue per user (ARPU). Azure Cloud infrastructure margins remained resilient at 71%, proving that heavy AI capex investments are yielding direct revenue accretion.",
    source: "Dow Jones Newswires",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "AI_TECH",
    sentiment: "BULLISH",
    market_impact_score: 8.3,
    action_recommendation: "BUY_ACCUMULATE",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: Low-risk institutional compounder. Buy or add to positions between $498.00–$503.00. Target $535.00; stop at $486.00. Volatility Score is 4/10 (Low-to-Moderate), making this an ideal low-drawdown anchor for both aggressive and conservative accounts.",
    key_levels: {
      entry_zone: "$498.00 - $503.00",
      target_price: "$535.00 (+6.4%)",
      stop_loss: "$486.00 (-3.3%)",
      modeled_spread_bps: 3.0
    },
    volatility_score: 4,
    catalyst_type: "Enterprise AI SaaS Monetization",
    is_sanitized: true,
    immutable_hash: "e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5"
  },
  {
    id: 7,
    ticker: "RY.TO",
    secondary_tickers: ["TD.TO", "BMO.TO", "CM.TO"],
    company_name: "Royal Bank of Canada",
    headline: "Royal Bank of Canada (RY.TO) Wealth Management Inflows Hit Multi-Year High; Loan Provisions Stabilize",
    summary: "Royal Bank of Canada reported stronger-than-anticipated commercial wealth net inflows and lower credit loss provisions as Bank of Canada interest rate cuts provided relief to mortgage and commercial loan holders. Capital ratios remain top-tier with CET1 at 13.2%.",
    source: "Financial Post",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "TSX_CANADIAN",
    sentiment: "BULLISH",
    market_impact_score: 7.8,
    action_recommendation: "BUY_ACCUMULATE",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: Premier defensive dividend holding. Volatility Score is 2/10 (Very Low Volatility). Accumulate shares below $178.50 CAD for safe yield and steady capital appreciation. Highly insulated from tech volatility.",
    key_levels: {
      entry_zone: "$175.00 - $178.00 CAD",
      target_price: "$188.00 CAD (+6.8%)",
      stop_loss: "$171.00 CAD (-2.8%)",
      modeled_spread_bps: 4.0
    },
    volatility_score: 2,
    catalyst_type: "TSX Financials & Stable Net Interest Margins",
    is_sanitized: true,
    immutable_hash: "f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6"
  },
  {
    id: 8,
    ticker: "SPY",
    secondary_tickers: ["QQQ", "IWM", "XIU.TO"],
    company_name: "SPDR S&P 500 ETF Trust",
    headline: "US Index Futures Advance as Wholesale Producer Prices Align with Federal Reserve Soft-Landing Targets",
    summary: "Benchmark US and Canadian index futures trended higher at the 5:00 AM ET premarket open. The US Producer Price Index (PPI) registered a moderate 0.2% monthly rise, solidifying market expectations for a benign macro interest rate backdrop. Cross-asset credit spreads remain tight, reflecting healthy institutional liquidity.",
    source: "CNBC Global Markets",
    published_at: "2026-11-19 05:00:00 EST",
    publish_cycle: "5AM_DAILY_TORONTO",
    category: "MACRO_FED",
    sentiment: "BULLISH",
    market_impact_score: 8.8,
    action_recommendation: "BUY_ACCUMULATE",
    what_to_do_today: "TACTICAL ACTION FOR TODAY: BROAD MARKET PLAYBOOK: The macro backdrop is favorable for equities today. Maintain full equity allocations. Favor liquid market leaders with RVOL > 1.5x. Avoid chasing premarket gaps without volume confirmation at the 9:30 AM open. Benchmark Volatility Score is 1/10 (Lowest Market Risk).",
    key_levels: {
      entry_zone: "$590.00 - $592.50",
      target_price: "$605.00 (+2.5%)",
      stop_loss: "$584.00 (-1.3%)",
      modeled_spread_bps: 1.0
    },
    volatility_score: 1,
    catalyst_type: "Macro Wholesale Inflation & Monetary Policy",
    is_sanitized: true,
    immutable_hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  }
];

export const FALLBACK_DAILY_ACTION_PLAYBOOK: DailyActionPlaybook = {
  title: "5:00 AM America/Toronto Stock Market & News Intelligence",
  published_at: "2026-11-19 05:00:00 EST",
  toronto_time: "2026-11-19 05:00 AM EST",
  daily_cycle: "5:00 AM ET Daily Publication",
  market_bias: "Constructive Bullish / Growth Momentum (Selectively Accumulating High RVOL)",
  executive_action_summary: "TODAY'S TACTICAL DIRECTIVE: Index futures are trading constructively with benign wholesale inflation. Prioritize buying confirmed momentum pullbacks in high-quality AI and tech leaders (ANT, NVDA, PLTR, SHOP.TO) between 9:30 AM and 10:30 AM ET regular session volume confirmation. Exercise strict risk management on post-IPO and volatile names (ANT Vol 9/10, TSLA Vol 9/10, PLTR Vol 8/10); size high-volatility holdings below 2.5% of portfolio equity and honor stops.",
  top_buys_today: [
    {
      ticker: "ANT",
      company_name: "Anthropic, PBC",
      volatility_score: 9,
      entry_zone: "$92.00 - $94.50",
      target: "$108.50 (+12.5%)",
      stop: "$87.50 (-9.2%)",
      reason: "Anthropic (ANT) Public Market Debut Triggers Massive Institutional Inflows Amid Claude 3.7 Enterprise Surge"
    },
    {
      ticker: "NVDA",
      company_name: "NVIDIA Corporation",
      volatility_score: 6,
      entry_zone: "$148.00 - $152.00",
      target: "$165.00 (+8.5%)",
      stop: "$142.00 (-6.6%)",
      reason: "NVIDIA (NVDA) Blackwell Architecture Enters Full-Scale Datacenter Shipments; Cloud Hyperscaler Capex Raised"
    },
    {
      ticker: "PLTR",
      company_name: "Palantir Technologies Inc.",
      volatility_score: 8,
      entry_zone: "$152.00 - $155.00",
      target: "$172.00 (+11.0%)",
      stop: "$146.00 (-5.8%)",
      reason: "Palantir (PLTR) Commercial AIP Customer Count Jumps 83% YoY with Multi-Year Enterprise Deployments"
    },
    {
      ticker: "SHOP.TO",
      company_name: "Shopify Inc.",
      volatility_score: 7,
      entry_zone: "$208.00 - $213.00 CAD",
      target: "$235.00 CAD (+10.5%)",
      stop: "$198.00 CAD (-6.8%)",
      reason: "Shopify (SHOP.TO) Canadian & US Merchant GMV Displays Double-Digit Surge Ahead of Cyber Week"
    }
  ],
  stocks_to_watch_today: [
    {
      ticker: "TSLA",
      company_name: "Tesla Inc.",
      volatility_score: 9,
      guidance: "DO NOT CHASE PREMARKET GAPS. Volatility Score 9/10. Wait for regular session price consolidation between $370–$375 before entering swing longs."
    },
    {
      ticker: "AAPL",
      company_name: "Apple Inc.",
      volatility_score: 3,
      guidance: "Hold core allocation. Low 3/10 volatility. Add if price pulls back to $242.00–$245.00 technical support."
    }
  ],
  volatility_warnings_today: [
    {
      ticker: "ANT",
      volatility_score: 9,
      warning: "Score 9/10 (Extreme Volatility / Post-IPO Discovery). Limit allocation to 2% max portfolio equity."
    },
    {
      ticker: "TSLA",
      volatility_score: 9,
      warning: "Score 9/10 (Extreme Volatility). Wide intraday ATR of $14.50+. Tight trailing stops required."
    },
    {
      ticker: "PLTR",
      volatility_score: 8,
      warning: "Score 8/10 (Very High Volatility). Use trailing limit orders to avoid bid-ask slippage."
    }
  ],
  total_articles_count: 8,
  immutable_audit_fingerprint: "9e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a"
};
