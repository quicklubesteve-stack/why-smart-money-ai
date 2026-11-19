'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { SimulationResult, Stock } from '../../lib/types';
import MetricCard from '../../components/MetricCard';
import {
  Play,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Target,
  BarChart2,
  Lock,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function SimulationPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [ticker, setTicker] = useState('NVDA');
  const [numSimulations, setNumSimulations] = useState(2000);
  const [horizonDays, setHorizonDays] = useState(30);
  const [targetPrice, setTargetPrice] = useState<number | undefined>(undefined);
  const [stopLoss, setStopLoss] = useState<number | undefined>(undefined);
  const [includeSmartMoneyBias, setIncludeSmartMoneyBias] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('PRO');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load stocks and current tier
  useEffect(() => {
    async function init() {
      try {
        const [scanned, tierData] = await Promise.all([
          api.getScannerStocks({ limit: 12 }).catch(() => []),
          api.getCurrentTier().catch(() => null)
        ]);
        setStocks(scanned);
        if (tierData?.current_tier) {
          setCurrentTier(tierData.current_tier);
          // If on FREE, default slider to 100
          if (tierData.current_tier === 'FREE') {
            setNumSimulations(100);
            setHorizonDays(20);
          }
        }
      } catch (err) {
        console.error('Failed to init simulation page:', err);
      }
    }
    init();
  }, []);

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.runSimulation({
        ticker,
        num_simulations: numSimulations,
        horizon_days: horizonDays,
        target_price: targetPrice,
        stop_loss: stopLoss,
        include_smart_money_bias: includeSmartMoneyBias,
        enforce_tier_limit: true
      });
      setResult(data);
      if (data.current_user_tier) {
        setCurrentTier(data.current_user_tier);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute Monte Carlo simulation.');
    } finally {
      setLoading(false);
    }
  };

  // Run on initial stock selection
  useEffect(() => {
    handleRunSimulation();
  }, [ticker]);

  // Selected stock object
  const selectedStock = stocks.find((s) => s.ticker === ticker);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Monte Carlo Future Price Simulator</span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              2,000 STOCHASTIC PATHS
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Simulates forward asset price probability cones using empirical drift, volatility, and institutional smart-money flow skew.
          </p>
        </div>

        {/* Tier Status Indicator & Link */}
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-700 text-xs font-mono flex items-center space-x-2">
            <span className="text-gray-400">Active Tier:</span>
            <span className={`font-bold ${currentTier === 'FREE' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentTier}
            </span>
          </div>
          <Link
            href="/pricing"
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
          >
            {currentTier === 'FREE' ? 'Upgrade to Pro' : 'Manage Plans'}
          </Link>
        </div>
      </div>

      {/* Tier Capping Notice Banner */}
      {result?.tier_capped && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 flex items-start space-x-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="text-white text-sm block mb-1">Free Tier Simulation Limit Enforced</strong>
            <p className="leading-relaxed mb-2">
              {result.tier_message || 'Your current Free Explorer tier is capped at 100 simulations and 20 days forward horizon.'}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center space-x-1.5 font-bold text-amber-300 hover:text-white underline font-sans"
            >
              <span>Unlock full 2,000 simulations and 90-day horizons on Pro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Simulation Configuration Controls */}
      <div className="glass-panel p-5 rounded-xl">
        <form onSubmit={handleRunSimulation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-mono">
            {/* Stock Selection */}
            <div>
              <label className="text-gray-400 block mb-1 font-sans">Select Stock</label>
              <select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white font-bold"
              >
                {stocks.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} ({s.exchange}) - ${s.current_price?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulation Runs */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-400 font-sans">Simulation Runs</label>
                {currentTier === 'FREE' && (
                  <span className="text-[10px] text-amber-400 font-sans">Max 100 on Free</span>
                )}
              </div>
              <select
                value={numSimulations}
                onChange={(e) => setNumSimulations(Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white font-bold"
              >
                <option value={100}>100 Runs (Free Tier)</option>
                <option value={500}>500 Runs</option>
                <option value={1000}>1,000 Runs</option>
                <option value={2000}>2,000 Runs (Recommended Pro)</option>
                <option value={5000}>5,000 Runs (Institutional)</option>
              </select>
            </div>

            {/* Horizon Days */}
            <div>
              <label className="text-gray-400 block mb-1 font-sans">Forward Horizon</label>
              <select
                value={horizonDays}
                onChange={(e) => setHorizonDays(Number(e.target.value))}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white font-bold"
              >
                <option value={10}>10 Trading Days (2 Weeks)</option>
                <option value={20}>20 Trading Days (1 Month)</option>
                <option value={30}>30 Trading Days (~6 Weeks)</option>
                <option value={60}>60 Trading Days (1 Quarter)</option>
                <option value={90}>90 Trading Days (Pro Full Horizon)</option>
              </select>
            </div>

            {/* Target Price */}
            <div>
              <label className="text-gray-400 block mb-1 font-sans">Target Price ($)</label>
              <input
                type="number"
                step="0.5"
                placeholder={result ? `$${(result.current_price * 1.08).toFixed(2)}` : 'Target'}
                value={targetPrice !== undefined ? targetPrice : ''}
                onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="text-gray-400 block mb-1 font-sans">Stop Loss ($)</label>
              <input
                type="number"
                step="0.5"
                placeholder={result ? `$${(result.current_price * 0.95).toFixed(2)}` : 'Stop'}
                value={stopLoss !== undefined ? stopLoss : ''}
                onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <label className="flex items-center space-x-2 text-xs text-gray-300 font-sans cursor-pointer">
              <input
                type="checkbox"
                checked={includeSmartMoneyBias}
                onChange={(e) => setIncludeSmartMoneyBias(e.target.checked)}
                className="rounded bg-dark-900 border-dark-700 text-cyan-500 focus:ring-0"
              />
              <span>
                Apply Institutional Smart Money Flow Drift (adjusts distribution trajectory by detected accumulation/distribution)
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-sans font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing 2,000 Paths...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute {numSimulations} Simulations</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono">
          ✕ {errorMsg}
        </div>
      )}

      {/* KPI Cards */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 block font-sans uppercase">Probability of Profit</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {(result.prob_profit * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-gray-500 font-sans">Terminal price &gt; Entry</span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 block font-sans uppercase">Median Price Target</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              ${result.median_terminal_price.toFixed(2)}
            </div>
            <span className="text-[10px] text-gray-500 font-sans">
              {result.expected_return_pct >= 0 ? '+' : ''}{result.expected_return_pct.toFixed(2)}% expected
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 block font-sans uppercase">Target Reach Rate</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {(result.prob_target_hit * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-gray-500 font-sans">Hits ${result.target_price?.toFixed(2)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 block font-sans uppercase">Stop Loss Hit Rate</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {(result.prob_stop_hit * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-gray-500 font-sans">Touches ${result.stop_loss?.toFixed(2)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 block font-sans uppercase">VaR (95% Confidence)</span>
            <div className="text-xl font-bold text-red-400 mt-1">
              {result.var_95_pct.toFixed(1)}%
            </div>
            <span className="text-[10px] text-gray-500 font-sans">${result.var_95_price.toFixed(2)} floor</span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 block font-sans uppercase">Simulated Paths</span>
            <div className="text-xl font-bold text-white mt-1">
              {result.num_simulations.toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-500 font-sans">{result.horizon_days} trading days</span>
          </div>
        </div>
      )}

      {/* SVG Monte Carlo Trajectory Fan Chart */}
      {result && (
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-dark-750">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Stochastic Trajectory Fan Chart (5th to 95th Percentile)</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Displays the 90% confidence distribution cone with individual sample random walks and median trajectory.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-cyan-400"></span>
                <span className="text-cyan-400 font-bold">Median (p50)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2 bg-cyan-500/20 border border-cyan-500/40 rounded-sm"></span>
                <span className="text-gray-300">50% Core (p25–p75)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-2 bg-cyan-500/10 border border-cyan-500/20 rounded-sm"></span>
                <span className="text-gray-400">90% Cone (p5–p95)</span>
              </div>
            </div>
          </div>

          {/* SVG Renderer */}
          <div className="h-72 w-full bg-dark-900 rounded-xl p-4 relative overflow-hidden flex items-end">
            {(() => {
              const width = 800;
              const height = 240;
              const p5 = result.percentile_curves.p5;
              const p25 = result.percentile_curves.p25;
              const p50 = result.percentile_curves.p50;
              const p75 = result.percentile_curves.p75;
              const p95 = result.percentile_curves.p95;
              const days = p50.length;

              const minPrice = Math.min(...p5, result.stop_loss || result.current_price * 0.9) * 0.96;
              const maxPrice = Math.max(...p95, result.target_price || result.current_price * 1.1) * 1.04;
              const priceRange = maxPrice - minPrice;

              const scaleX = (d: number) => 30 + (d / (days - 1)) * (width - 60);
              const scaleY = (p: number) => height - 20 - ((p - minPrice) / priceRange) * (height - 40);

              // Build polygon points for 5-95% cone
              const p95Points = p95.map((p, i) => `${scaleX(i)},${scaleY(p)}`).join(' ');
              const p5PointsRev = p5.slice().reverse().map((p, i) => `${scaleX(days - 1 - i)},${scaleY(p)}`).join(' ');
              const cone90 = `${p95Points} ${p5PointsRev}`;

              // Build polygon points for 25-75% cone
              const p75Points = p75.map((p, i) => `${scaleX(i)},${scaleY(p)}`).join(' ');
              const p25PointsRev = p25.slice().reverse().map((p, i) => `${scaleX(days - 1 - i)},${scaleY(p)}`).join(' ');
              const cone50 = `${p75Points} ${p25PointsRev}`;

              // Median line
              const medianPath = p50.map((p, i) => `${scaleX(i)},${scaleY(p)}`).join(' ');

              return (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full font-mono">
                  {/* Grid Lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                    const priceLevel = minPrice + ratio * priceRange;
                    const y = scaleY(priceLevel);
                    return (
                      <g key={ratio}>
                        <line x1="30" y1={y} x2={width - 30} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                        <text x="35" y={y - 4} fill="#64748b" fontSize="10">
                          ${priceLevel.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* 90% Confidence Cone */}
                  <polygon points={cone90} fill="#06b6d4" fillOpacity="0.12" stroke="#06b6d4" strokeOpacity="0.25" strokeWidth="1" />

                  {/* 50% Confidence Core */}
                  <polygon points={cone50} fill="#06b6d4" fillOpacity="0.22" stroke="#06b6d4" strokeOpacity="0.4" strokeWidth="1" />

                  {/* Individual Sample Paths (faint stochastic random walks) */}
                  {result.sample_paths.slice(0, 15).map((path, idx) => {
                    const samplePoints = path.map((p, i) => `${scaleX(i)},${scaleY(p)}`).join(' ');
                    return (
                      <polyline
                        key={idx}
                        points={samplePoints}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="0.75"
                        strokeOpacity="0.25"
                      />
                    );
                  })}

                  {/* Target Price Horizontal Line */}
                  {result.target_price && (
                    <g>
                      <line
                        x1="30"
                        y1={scaleY(result.target_price)}
                        x2={width - 30}
                        y2={scaleY(result.target_price)}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text x={width - 130} y={scaleY(result.target_price) - 4} fill="#10b981" fontSize="11" fontWeight="bold">
                        Target ${result.target_price.toFixed(2)}
                      </text>
                    </g>
                  )}

                  {/* Stop Loss Horizontal Line */}
                  {result.stop_loss && (
                    <g>
                      <line
                        x1="30"
                        y1={scaleY(result.stop_loss)}
                        x2={width - 30}
                        y2={scaleY(result.stop_loss)}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text x={width - 130} y={scaleY(result.stop_loss) + 12} fill="#ef4444" fontSize="11" fontWeight="bold">
                        Stop ${result.stop_loss.toFixed(2)}
                      </text>
                    </g>
                  )}

                  {/* Current Entry Price Line */}
                  <line
                    x1="30"
                    y1={scaleY(result.current_price)}
                    x2={width - 30}
                    y2={scaleY(result.current_price)}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text x="35" y={scaleY(result.current_price) + 12} fill="#94a3b8" fontSize="10">
                    Entry: ${result.current_price.toFixed(2)}
                  </text>

                  {/* Median Path Polyline */}
                  <polyline points={medianPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                </svg>
              );
            })()}
          </div>

          <div className="flex justify-between text-xs font-mono text-gray-400 px-2">
            <span>Day 0 (Today)</span>
            <span>Day {Math.round(result.horizon_days / 2)}</span>
            <span>Day {result.horizon_days} (Terminal Settlement)</span>
          </div>
        </div>
      )}

      {/* Terminal Price Distribution Histogram */}
      {result && (
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-750">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>Terminal Price Outcome Distribution</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Frequency histogram across all {result.num_simulations.toLocaleString()} terminal prices at day {result.horizon_days}.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-850 text-gray-300 border border-dark-700">
              15 PRICE BINS
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-15 gap-1.5 items-end h-40 pt-6">
            {result.distribution_histogram.map((bin, i) => {
              const maxFreq = Math.max(...result.distribution_histogram.map((b) => b.frequency_pct));
              const barHeightPct = Math.max(6, (bin.frequency_pct / maxFreq) * 100);
              const isProfit = bin.bin_start >= result.current_price;

              return (
                <div key={i} className="flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 z-20 pointer-events-none p-1.5 rounded bg-dark-950 border border-dark-700 text-[10px] font-mono text-white whitespace-nowrap shadow-xl">
                    ${bin.bin_start}–${bin.bin_end}: {bin.count} paths ({bin.frequency_pct}%)
                  </div>

                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      isProfit
                        ? 'bg-emerald-500/70 hover:bg-emerald-400'
                        : 'bg-red-500/70 hover:bg-red-400'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-gray-500 mt-1 truncate w-full text-center">
                    ${bin.bin_start.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-dark-800 text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-red-500/70"></span>
              <span>Loss Region ({(100 - result.prob_profit * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/70"></span>
              <span>Profit Region ({(result.prob_profit * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
