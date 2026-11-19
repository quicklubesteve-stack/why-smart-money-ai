import {
  Stock, Bar, SmartMoneyMetric, TradingSignal, AIPrediction,
  MarketBrief, PortfolioSummary, PerformanceOverview, ProvidersSummary, SimulationResult
} from './types';
import {
  FALLBACK_STOCKS, FALLBACK_SIGNALS, FALLBACK_BRIEF,
  FALLBACK_PORTFOLIO, FALLBACK_PERFORMANCE, generateClientMonteCarlo
} from './fallbackData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      cache: 'no-store'
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Network or cross-origin failure -> Fallback to client-side demonstration data
  }

  // Graceful client-side fallback
  return getClientFallback<T>(endpoint, options);
}

function getClientFallback<T>(endpoint: string, options?: RequestInit): T {
  if (endpoint.startsWith('/api/scanner')) {
    return FALLBACK_STOCKS as unknown as T;
  }
  if (endpoint.startsWith('/api/stocks/') && endpoint.includes('/bars')) {
    const bars: Bar[] = [];
    const now = new Date();
    for (let i = 60; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const base = 120 + Math.sin(i * 0.3) * 8 + (60 - i) * 0.15;
      bars.push({
        date: d.toISOString().split('T')[0],
        open: Number((base - 0.5).toFixed(2)),
        high: Number((base + 2.5).toFixed(2)),
        low: Number((base - 1.5).toFixed(2)),
        close: Number((base + 1.0).toFixed(2)),
        volume: 35000000 + Math.floor(Math.random() * 20000000),
        vwap: Number(base.toFixed(2))
      });
    }
    return bars as unknown as T;
  }
  if (endpoint.startsWith('/api/stocks/')) {
    const ticker = endpoint.split('/')[3]?.split('?')[0];
    const found = FALLBACK_STOCKS.find(s => s.ticker === ticker) || FALLBACK_STOCKS[0];
    return found as unknown as T;
  }
  if (endpoint.startsWith('/api/signals')) {
    return FALLBACK_SIGNALS as unknown as T;
  }
  if (endpoint.startsWith('/api/briefs')) {
    return FALLBACK_BRIEF as unknown as T;
  }
  if (endpoint.startsWith('/api/portfolio')) {
    return FALLBACK_PORTFOLIO as unknown as T;
  }
  if (endpoint.startsWith('/api/performance')) {
    return FALLBACK_PERFORMANCE as unknown as T;
  }
  if (endpoint.startsWith('/api/tiers/plans')) {
    return {
      current_tier: "PRO",
      plans: [
        {
          id: "FREE",
          name: "Explorer (Free)",
          tagline: "Essential quantitative scanner & market intelligence",
          monthly_price: 0,
          annual_price: 0,
          max_simulations: 100,
          max_simulation_horizon_days: 20,
          scanner_universe_limit: 5,
          morning_brief_opportunities_limit: 3,
          smart_money_details_enabled: false,
          telegram_alerts_enabled: false,
          paper_trading_daily_limit: 3,
          features: [
            "Basic scanner (Top 5 liquid US/TSX stocks)",
            "100 Monte Carlo simulation runs",
            "5:00 AM Market Brief preview (Top 3 opportunities)",
            "Basic VWAP & RVOL indicators",
            "Simulated paper trading (up to 3 orders/day)",
            "Standard community support"
          ],
          upgrade_cta: "Get Started Free"
        },
        {
          id: "PRO",
          name: "Quantitative Trader (Pro)",
          tagline: "Full institutional smart money intelligence & 2,000 simulations",
          monthly_price: 49,
          annual_price: 39,
          max_simulations: 2000,
          max_simulation_horizon_days: 90,
          scanner_universe_limit: null,
          morning_brief_opportunities_limit: 10,
          smart_money_details_enabled: true,
          telegram_alerts_enabled: true,
          paper_trading_daily_limit: null,
          popular: true,
          features: [
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
          upgrade_cta: "Upgrade to Pro"
        },
        {
          id: "INSTITUTIONAL",
          name: "Institutional Enterprise",
          tagline: "Dedicated quantitative infrastructure for hedge funds & family offices",
          monthly_price: 199,
          annual_price: 159,
          max_simulations: 10000,
          max_simulation_horizon_days: 252,
          scanner_universe_limit: null,
          morning_brief_opportunities_limit: 50,
          smart_money_details_enabled: true,
          telegram_alerts_enabled: true,
          paper_trading_daily_limit: null,
          features: [
            "10,000 high-frequency Monte Carlo simulation paths",
            "Multi-asset custom universe & watchlists",
            "Direct API access with high rate limits",
            "Custom purged walk-forward ML model hyperparameters",
            "Dedicated VPS deployment & backup replication",
            "Multi-seat team licenses & RBAC audit logging",
            "Dedicated quantitative researcher priority support"
          ],
          upgrade_cta: "Contact Institutional Sales"
        }
      ]
    } as unknown as T;
  }
  if (endpoint.startsWith('/api/tiers/current')) {
    return {
      id: "PRO",
      name: "Quantitative Trader (Pro)",
      current_tier: "PRO",
      max_simulations: 2000,
      max_simulation_horizon_days: 90
    } as unknown as T;
  }
  if (endpoint.startsWith('/api/simulation/run')) {
    let bodyObj: any = {};
    if (options?.body) {
      try { bodyObj = JSON.parse(options.body as string); } catch(e) {}
    }
    const tick = bodyObj.ticker || 'NVDA';
    const found = FALLBACK_STOCKS.find(s => s.ticker === tick) || FALLBACK_STOCKS[0];
    const sim = generateClientMonteCarlo(tick, found.current_price || 128.50, bodyObj.num_simulations || 2000, bodyObj.horizon_days || 30);
    return sim as unknown as T;
  }

  return {} as unknown as T;
}

export const api = {
  getScannerStocks: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson<Stock[]>(`/api/scanner?${query}`);
  },

  getStock: (ticker: string) => {
    return fetchJson<Stock>(`/api/stocks/${ticker}`);
  },

  getStockBars: (ticker: string, limit = 90) => {
    return fetchJson<Bar[]>(`/api/stocks/${ticker}/bars?limit=${limit}`);
  },

  getTechnicalAnalysis: (ticker: string) => {
    return fetchJson<any>(`/api/stocks/${ticker}/technical-analysis`);
  },

  getSmartMoney: (ticker: string) => {
    return fetchJson<SmartMoneyMetric>(`/api/smart-money/${ticker}`);
  },

  getSignals: (params?: { recommendation?: string; min_quality_score?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<TradingSignal[]>(`/api/signals?${query}`);
  },

  getSignalByTicker: (ticker: string) => {
    return fetchJson<TradingSignal>(`/api/signals/${ticker}`);
  },

  getPredictions: (ticker: string) => {
    return fetchJson<AIPrediction[]>(`/api/predictions/${ticker}`);
  },

  getLatestBrief: () => {
    return fetchJson<MarketBrief>('/api/briefs/latest');
  },

  getBriefHistory: () => {
    return fetchJson<MarketBrief[]>('/api/briefs/history');
  },

  generateBriefNow: (sessionType: string = '5AM_PREMARKET') => {
    return fetchJson<MarketBrief>(`/api/briefs/generate-now?session_type=${sessionType}`, {
      method: 'POST'
    });
  },

  getSchedulerStatus: () => {
    return fetchJson<{
      scheduler_running: boolean;
      timezone: string;
      current_toronto_time: string;
      registered_jobs: Array<{ id: string; name: string; next_run_time: string | null }>;
    }>('/api/scheduler/status');
  },

  getPortfolio: () => {
    return fetchJson<PortfolioSummary>('/api/portfolio');
  },

  submitPaperTrade: (trade: {
    ticker: string;
    side: string;
    shares: number;
    limit_price?: number;
    confirm_paper_trading: boolean;
  }) => {
    return fetchJson('/api/portfolio/trade', {
      method: 'POST',
      body: JSON.stringify(trade)
    });
  },

  closePaperPosition: (ticker: string) => {
    return fetchJson('/api/portfolio/close-position', {
      method: 'POST',
      body: JSON.stringify({
        ticker,
        confirm_paper_trading: true
      })
    });
  },

  getPerformance: () => {
    return fetchJson<PerformanceOverview>('/api/performance');
  },

  runBacktest: (params: { ticker: string; horizon_days?: number; target_profit_pct?: number; stop_loss_pct?: number }) => {
    return fetchJson<any>('/api/performance/run-backtest', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  trainAndForecast: (ticker: string, horizon: string = "5D") => {
    return fetchJson<AIPrediction>(`/api/predictions/${ticker}/train-and-forecast?horizon=${horizon}`, {
      method: 'POST'
    });
  },

  getProvidersStatus: () => {
    return fetchJson<ProvidersSummary>('/api/providers/status');
  },

  runSimulation: (params: {
    ticker: string;
    num_simulations?: number;
    horizon_days?: number;
    target_price?: number;
    stop_loss?: number;
    include_smart_money_bias?: boolean;
    enforce_tier_limit?: boolean;
  }) => {
    return fetchJson<any>('/api/simulation/run', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  getCurrentTier: () => {
    return fetchJson<any>('/api/tiers/current');
  },

  getTierPlans: () => {
    return fetchJson<{ current_tier: string; plans: any[] }>('/api/tiers/plans');
  },

  switchTier: (tier: string) => {
    return fetchJson<any>('/api/tiers/switch', {
      method: 'POST',
      body: JSON.stringify({ tier })
    });
  }
};
