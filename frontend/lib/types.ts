export interface Stock {
  id: number;
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  current_price?: number;
  change_pct: number;
  relative_volume: number;
  volatility_30d: number;
  volatility_score?: number; // 1 to 10 scale (1 = very low, 10 = very volatile)
  spread_pct: number;
  atr_14?: number;
  rsi_14?: number;
  data_quality_score?: number;
  data_quality_status?: string;
  avg_volume_30d?: number;
  is_liquid: boolean;
  latest_update: string;
  data_source: string;
}

export interface TechnicalAnalysisResult {
  ticker: string;
  data_quality_ok: boolean;
  data_quality_score: number;
  issues: string[];
  current_price: number;
  vwap: number;
  vwap_ratio: number;
  rvol: number;
  atr_14: number;
  rsi_14: number;
  divergence: string;
  divergence_explanation: string;
  off_exchange_ratio: number;
  sec_13f: {
    ticker: string;
    net_institutional_change_pct: number;
    filing_quarter: string;
    top_institutional_holders: string[];
    data_delay_days: number;
    is_realtime: boolean;
    disclaimer: string;
  };
  composite_smart_money_score: number;
  currency: string;
  data_source: string;
}

export interface Bar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface SmartMoneyMetric {
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  as_of_date: string;
  rel_volume: number;
  vwap_ratio: number;
  accumulation_distribution: number;
  on_balance_volume: number;
  volume_price_divergence: string;
  block_trade_count: number;
  off_exchange_ratio: number;
  institutional_13f_change_pct: number;
  composite_score: number;
  proxy_confidence: string;
  explanation?: string;
  disclaimer: string;
}

export interface TradingSignal {
  id: number;
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  generated_at: string;
  horizon: string;
  recommendation: 'BUY' | 'WATCH' | 'HOLD' | 'AVOID' | 'SELL/EXIT';
  quality_score: number;
  calibrated_prob: number;
  latest_quote: number;
  entry_zone_min: number;
  entry_zone_max: number;
  target_price: number;
  stop_loss: number;
  risk_reward_ratio: number;
  estimated_slippage_bps: number;
  invalidation_rule?: string;
  evidence_pro: string[];
  evidence_con: string[];
  status: string;
}

export interface AIPrediction {
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  generated_at: string;
  horizon: string;
  predicted_direction: 'UP' | 'DOWN' | 'SIDEWAYS';
  expected_return_pct: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  model_confidence: number;
  uncertainty_level: string;
  is_abstained: boolean;
  abstain_reason?: string;
  top_factors: { feature: string; importance: number }[];
}

export interface MarketBrief {
  id: number;
  brief_date: string;
  generated_at: string;
  session_type: string;
  macro_summary: string;
  us_market_sentiment: string;
  tsx_market_sentiment: string;
  index_futures: Record<string, { name: string; price: number; change_pct: number }>;
  premarket_movers: { ticker: string; premarket_price: number; gap_pct: number; premarket_volume: number; note: string }[];
  top_10_opportunities: { rank: number; ticker: string; exchange: string; score: number; signal: string; catalyst: string }[];
  sector_rotation: { Leading: string[]; Improving: string[]; Lagging: string[] };
  catalysts_and_risks: string[];
  immutable_hash: string;
  disclaimer: string;
}

export interface PaperPosition {
  id: number;
  ticker: string;
  shares: number;
  average_entry_price: number;
  current_price: number;
  currency: string;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
}

export interface PaperOrder {
  id: number;
  ticker: string;
  side: string;
  order_type: string;
  shares: number;
  requested_price: number;
  executed_price?: number;
  slippage_bps: number;
  fee_paid: number;
  status: string;
  created_at: string;
  executed_at?: string;
  notes?: string;
}

export interface PortfolioSummary {
  account_number: string;
  currency: string;
  cash_balance: number;
  positions_value: number;
  total_equity: number;
  total_unrealized_pnl: number;
  is_live_trading_enabled: boolean;
  positions: PaperPosition[];
  recent_orders: PaperOrder[];
}

export interface RealizedPrediction {
  id: number;
  ticker: string;
  exchange: string;
  currency: string;
  horizon: string;
  forecast_timestamp: string;
  predicted_direction: string;
  calibrated_prob: number;
  entry_price: number;
  realized_timestamp: string;
  realized_price: number;
  realized_return_pct: number;
  directional_hit: boolean;
  trade_win: boolean;
  brier_score_component: number;
  environment: string;
}

export interface EnvironmentMetric {
  environment: string;
  status: string;
  sample_count: number;
  win_rate?: number;
  directional_accuracy?: number;
  sharpe_ratio?: number;
  net_return_pct?: number;
}

export interface PerformanceOverview {
  aspirational_win_rate_target: number;
  measured_win_rate: number;
  directional_accuracy: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  total_trades_evaluated: number;
  benchmark_alpha_pct: number;
  calibration_quality: string;
  disclaimer: string;
  history: {
    date: string;
    system_cumulative_return: number;
    benchmark_spy_return: number;
    win_rate: number;
    category: string;
  }[];
  horizons: {
    horizon: string;
    directional_accuracy: number;
    win_rate: number;
    sample_count: number;
    profit_factor: number;
    brier_score: number;
  }[];
  environments?: EnvironmentMetric[];
  realized_predictions_log?: RealizedPrediction[];
}

export interface ProviderStatus {
  name: string;
  category: string;
  status: string;
  mode: string;
  notes: string;
}

export interface ProvidersSummary {
  is_demo_mode: boolean;
  active_timezone: string;
  providers: ProviderStatus[];
}

export interface SimulationResult {
  ticker: string;
  stock_name: string;
  exchange: string;
  currency: string;
  current_price: number;
  num_simulations: number;
  horizon_days: number;
  annualized_volatility_pct: number;
  effective_drift_daily_bps: number;
  smart_money_score: number;
  smart_money_bias_applied: boolean;
  expected_terminal_price: number;
  median_terminal_price: number;
  expected_return_pct: number;
  prob_profit: number;
  target_price?: number;
  prob_target_hit: number;
  stop_loss?: number;
  prob_stop_hit: number;
  var_95_price: number;
  var_95_pct: number;
  cvar_95_pct: number;
  percentile_curves: {
    p5: number[];
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
    p95: number[];
  };
  distribution_histogram: Array<{
    bin_start: number;
    bin_end: number;
    count: number;
    frequency_pct: number;
  }>;
  sample_paths: number[][];
  tier_capped: boolean;
  tier_message?: string;
  current_user_tier: string;
  requested_simulations: number;
}

export interface TierPlan {
  id: string;
  name: string;
  tagline: string;
  monthly_price: number;
  annual_price: number;
  max_simulations: number;
  max_simulation_horizon_days: number;
  scanner_universe_limit: number | null;
  morning_brief_opportunities_limit: number;
  smart_money_details_enabled: boolean;
  telegram_alerts_enabled: boolean;
  paper_trading_daily_limit: number | null;
  popular?: boolean;
  features: string[];
  upgrade_cta: string;
  is_current?: boolean;
}

export interface TierPlansResponse {
  current_tier: string;
  plans: TierPlan[];
}

export interface StockOverview {
  stock: Stock;
  volatility: {
    volatility_score: number; // 1 to 10 scale (1 = very low, 10 = very volatile)
    volatility_scale?: string; // e.g. "9/10"
    volatility_rating?: string; // e.g. "9/10 (Extreme Volatility)"
    volatility_30d_pct: number;
    annualized_volatility_pct: number;
    atr_14: number;
    relative_volume: number;
    spread_pct: number;
    spread_bps: number;
    volatility_regime: string;
    explanation: string;
  };
  bars: Bar[];
  prediction?: {
    horizon: string;
    predicted_direction: string;
    expected_return_pct: number;
    confidence_interval_low: number;
    confidence_interval_high: number;
    model_confidence: number;
    model_confidence_pct: number;
    uncertainty_level: string;
    is_abstained?: boolean;
    top_factors: Array<{ feature: string; importance: number }>;
  };
  smart_money?: {
    composite_score: number;
    volume_price_divergence: string;
    block_trade_count: number;
    off_exchange_ratio: number;
    institutional_13f_change_pct: number;
    proxy_confidence: string;
    explanation: string;
  };
}

export interface StockNewsArticle {
  id: number;
  ticker: string;
  secondary_tickers: string[];
  company_name: string;
  headline: string;
  summary: string;
  source: string;
  published_at: string;
  publish_cycle: string;
  category: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL_CAUTION';
  market_impact_score: number;
  action_recommendation: 'BUY_ACCUMULATE' | 'HOLD_WATCH' | 'AVOID_TRIM' | 'PROFIT_TAKE';
  what_to_do_today: string;
  key_levels: {
    entry_zone?: string;
    target_price?: string;
    stop_loss?: string;
    modeled_spread_bps?: number;
  };
  volatility_score: number;
  catalyst_type: string;
  is_sanitized: boolean;
  immutable_hash: string;
}

export interface DailyActionPlaybook {
  title: string;
  published_at: string;
  toronto_time: string;
  daily_cycle: string;
  market_bias: string;
  executive_action_summary: string;
  top_buys_today: Array<{
    ticker: string;
    company_name: string;
    volatility_score: number;
    entry_zone: string;
    target: string;
    stop: string;
    reason: string;
  }>;
  stocks_to_watch_today: Array<{
    ticker: string;
    company_name: string;
    volatility_score: number;
    guidance: string;
  }>;
  volatility_warnings_today: Array<{
    ticker: string;
    volatility_score: number;
    warning: string;
  }>;
  total_articles_count: number;
  immutable_audit_fingerprint: string;
}
