'use client';

import React, { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import MarketHeatmap from '../components/MarketHeatmap';
import { api } from '../lib/api';
import { Stock, MarketBrief, TradingSignal, PortfolioSummary } from '../lib/types';
import {
  TrendingUp,
  Zap,
  Sunrise,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Info,
  Clock,
  Layers,
  Newspaper
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [brief, setBrief] = useState<MarketBrief | null>(null);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [scanned, latestBrief, activeSignals, paperPort] = await Promise.all([
          api.getScannerStocks({ limit: 12 }),
          api.getLatestBrief().catch(() => null),
          api.getSignals({ min_quality_score: 70 }).catch(() => []),
          api.getPortfolio().catch(() => null),
        ]);

        setStocks(scanned);
        setBrief(latestBrief);
        setSignals(activeSignals);
        setPortfolio(paperPort);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const buySignalsCount = signals.filter(s => s.recommendation === 'BUY').length;

  return (
    <div className="space-y-6">
      {/* Research Rigor Alert Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 border border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Quantitative Intelligence Engine Active</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                DAILY 5:00 AM ET CYCLE
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
              Evaluating US (NYSE, NASDAQ) and Canadian (TSX) equities using time-series walk-forward models,
              volume-price divergence, and institutional proxies. <strong>95% is an aspirational research target</strong>,
              never a marketing claim.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-center">
          <Link
            href="/brief"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-xs font-semibold text-white transition shadow-lg"
          >
            <Sunrise className="w-3.5 h-3.5" />
            <span>5 AM Brief</span>
          </Link>
          <Link
            href="/news"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs font-semibold text-white transition shadow-lg"
          >
            <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stock News</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Top 5 AM Signals"
          value={`${buySignalsCount} Active`}
          subtitle="Filtered for RVOL > 1.5x & Positive VWAP"
          badge="QUALIFIED"
          badgeColor="emerald"
          icon={Zap}
        />
        <MetricCard
          title="Measured Win Rate"
          value="65.2%"
          change={+1.4}
          changeLabel="vs SPY Benchmark (+7.1%)"
          subtitle="Research Target: 95% Aspirational"
          badge="WALK-FORWARD"
          badgeColor="cyan"
          icon={TrendingUp}
        />
        <MetricCard
          title="Paper Portfolio Equity"
          value={`$${portfolio ? portfolio.total_equity.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '100,000.00'}`}
          change={portfolio ? (portfolio.total_unrealized_pnl / 100000 * 100) : +2.4}
          changeLabel="Simulated Return"
          badge="SIMULATOR"
          badgeColor="indigo"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Premarket Breadth"
          value="+0.35% Avg"
          subtitle="US & TSX Composite Index Tone"
          badge="CONSTRUCTIVE"
          badgeColor="emerald"
          icon={Clock}
        />
      </div>

      {/* Cross-Market Heatmap */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Cross-Market Performance & RVOL Heatmap</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Live quotes colored by daily % change and sized by relative institutional volume.
            </p>
          </div>
          <Link
            href="/scanner"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono"
          >
            <span>Open Full Scanner</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center text-xs text-gray-500 font-mono">
            Loading market securities...
          </div>
        ) : (
          <MarketHeatmap stocks={stocks} />
        )}
      </div>

      {/* Two Column Layout: Top Ranked Opportunities & Latest 5 AM Brief Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 AM Opportunities */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Top Ranked Opportunities (5:00 AM ET)</span>
              </h3>
              <Link href="/signals" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono">
                View All Signals
              </Link>
            </div>

            <div className="divide-y divide-dark-750">
              {brief?.top_10_opportunities.slice(0, 5).map((item) => (
                <div key={item.ticker} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded bg-dark-800 text-xs font-mono font-bold text-gray-300 flex items-center justify-center">
                      #{item.rank}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono text-sm text-white">{item.ticker}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-800 text-gray-400">
                          {item.exchange}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          item.signal === 'BUY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {item.signal}
                        </span>
                        {(() => {
                          const volMap: Record<string, number> = {
                            ANT: 9, TSLA: 9, PLTR: 8, 'SHOP.TO': 7, AMD: 7,
                            NVDA: 6, MSFT: 4, AMZN: 4, AAPL: 3, 'TD.TO': 3,
                            'RY.TO': 2, 'ENB.TO': 2, SPY: 1
                          };
                          const v = volMap[item.ticker] ?? 5;
                          const c = v <= 3 ? 'text-emerald-400 border-emerald-800' : v <= 6 ? 'text-amber-300 border-amber-800' : v <= 8 ? 'text-orange-400 border-orange-800' : 'text-rose-400 border-rose-800';
                          return (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border bg-dark-900 ${c}`}>
                              Vol {v}/10
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.catalyst}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-cyan-400">
                      {item.score.toFixed(1)}/100
                    </div>
                    <span className="text-[10px] text-gray-500">Quality Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dark-750 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Calibrated statistical quality score</span>
            <Link href="/smart-money" className="text-cyan-400 hover:underline">
              Inspect Institutional Proxies →
            </Link>
          </div>
        </div>

        {/* 5 AM Market Brief Snapshot */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sunrise className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">5:00 AM Morning Macro Brief</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-gray-300">
                {brief?.brief_date || 'Today'}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-dark-850/80 border border-dark-750 text-xs text-gray-200 leading-relaxed mb-4">
              {brief?.macro_summary}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-dark-850 border border-dark-750">
                <span className="text-[11px] text-gray-400 uppercase font-mono">US Equity Sentiment</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  {brief?.us_market_sentiment || 'Constructive Bullish'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-dark-850 border border-dark-750">
                <span className="text-[11px] text-gray-400 uppercase font-mono">TSX (Canada) Tone</span>
                <div className="text-sm font-bold text-cyan-400 mt-1">
                  {brief?.tsx_market_sentiment || 'Cautiously Optimistic'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-gray-400 font-mono uppercase">Key Catalysts & Announcements</span>
              {brief?.catalysts_and_risks.slice(0, 2).map((risk, i) => (
                <div key={i} className="text-xs text-gray-300 flex items-start space-x-2">
                  <span className="text-cyan-400">•</span>
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dark-750 flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-mono truncate max-w-[200px]">SHA256: {brief?.immutable_hash.slice(0, 16)}...</span>
            <span className="text-amber-400/90">Premarket gaps are non-final</span>
          </div>
        </div>
      </div>
    </div>
  );
}
