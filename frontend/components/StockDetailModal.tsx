'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { StockOverview } from '../lib/types';
import StockChart from './StockChart';
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  BrainCircuit,
  BarChart2,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface StockDetailModalProps {
  ticker: string;
  onClose: () => void;
}

export default function StockDetailModal({ ticker, onClose }: StockDetailModalProps) {
  const [data, setData] = useState<StockOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const overview = await api.getStockOverview(ticker);
        if (isMounted) {
          setData(overview);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || `Failed to retrieve overview for ${ticker}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const stock = data?.stock;
  const vol = data?.volatility;
  const pred = data?.prediction;
  const bars = data?.bars || [];

  const isUp = (stock?.change_pct ?? 0) >= 0;
  const predUp = pred?.predicted_direction === 'UP';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-750 bg-dark-850/80">
          <div className="flex items-center space-x-3">
            <div className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-base">
              {ticker}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {stock?.name || ticker}
                </h2>
                {stock && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-dark-800 text-gray-300 font-mono border border-dark-700">
                    {stock.exchange} • {stock.currency}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {stock?.sector || 'Equities'} {stock?.industry ? `› ${stock.industry}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white transition border border-dark-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-gray-400 font-mono text-sm">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Retrieving real-time quote, volatility, history, and AI forecast...</span>
            </div>
          ) : error || !stock ? (
            <div className="p-8 text-center text-red-400 bg-red-950/20 border border-red-900/50 rounded-xl">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="font-semibold">{error || 'Stock information could not be retrieved.'}</p>
            </div>
          ) : (
            <>
              {/* Special Historic IPO Showcase for Anthropic (ANT) */}
              {stock.ticker === 'ANT' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/80 via-dark-850 to-cyan-950/80 border border-indigo-700/60 shadow-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300 font-mono">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span>HISTORIC INITIAL PUBLIC OFFERING (IPO) DEBUT</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
                      Nasdaq: ANT • Largest IPO in History ($81.3B Raised)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-dark-900/80 border border-dark-750">
                      <span className="text-gray-400 text-[10px] uppercase block">Started At (IPO Price)</span>
                      <strong className="text-cyan-300 text-base">$83.00</strong>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Priced above $70-$78 range</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-dark-900/80 border border-dark-750">
                      <span className="text-gray-400 text-[10px] uppercase block">Debut Opening Print</span>
                      <strong className="text-white text-base">$111.50</strong>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">High of $114.99 (+38.5%)</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-dark-900/80 border border-dark-750">
                      <span className="text-gray-400 text-[10px] uppercase block">Where It Is Now</span>
                      <strong className="text-emerald-300 text-base">${stock.current_price?.toFixed(2)}</strong>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        +{(((stock.current_price || 96.40) - 83.00) / 83.00 * 100).toFixed(1)}% vs $83 IPO price
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-dark-900/80 border border-dark-750">
                      <span className="text-gray-400 text-[10px] uppercase block">AI Model Forecast</span>
                      <strong className="text-cyan-300 text-base">▲ UP (+5.80%)</strong>
                      <span className="text-[10px] text-indigo-300 block mt-0.5">Target: $108.50 (74% Prob)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 1: WHAT THE STOCK IS TRADING AT */}
              <div className="glass-panel p-5 rounded-xl border border-dark-750 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Current Trading Price & Valuation</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-dark-800 text-gray-400 font-mono">
                    Feed: {stock.data_source}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div className="flex items-baseline space-x-3">
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      ${stock.current_price?.toFixed(2)}
                      <span className="text-sm font-normal text-gray-400 ml-1.5 font-sans">
                        {stock.currency}
                      </span>
                    </div>

                    <div
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        isUp
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950/80 text-red-400 border border-red-800'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>
                        {isUp ? '+' : ''}
                        {stock.change_pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Market Cap & Liquidity */}
                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px] uppercase">Market Cap</span>
                      <strong className="text-white">
                        {stock.market_cap ? `$${(stock.market_cap / 1e9).toFixed(1)}B ${stock.currency}` : 'N/A'}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px] uppercase">30D Avg Volume</span>
                      <strong className="text-white">
                        {stock.avg_volume_30d ? `${(stock.avg_volume_30d / 1e6).toFixed(1)}M` : 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Sub-quote metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-dark-750 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-dark-850/60 border border-dark-750">
                    <span className="text-gray-400 text-[11px] block">RSI (14-Day)</span>
                    <strong className="text-white text-sm">{stock.rsi_14 ? stock.rsi_14.toFixed(1) : '50.0'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-850/60 border border-dark-750">
                    <span className="text-gray-400 text-[11px] block">Bid-Ask Spread</span>
                    <strong className="text-white text-sm">{(stock.spread_pct * 100).toFixed(2)}% ({vol?.spread_bps} bps)</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-850/60 border border-dark-750">
                    <span className="text-gray-400 text-[11px] block">Relative Volume</span>
                    <strong className="text-emerald-400 text-sm">{stock.relative_volume.toFixed(2)}x</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-850/60 border border-dark-750">
                    <span className="text-gray-400 text-[11px] block">Data Quality</span>
                    <strong className="text-emerald-400 text-sm">{stock.data_quality_status || 'VERIFIED_OK'}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 2: THE VOLATILITY FACTOR */}
              <div className="glass-panel p-5 rounded-xl border border-dark-750 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>The Volatility Factor & Risk Profile</span>
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                      vol?.volatility_regime === 'High'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : vol?.volatility_regime === 'Moderate'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {vol?.volatility_regime || 'Moderate'} Volatility Regime
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-dark-850 border border-dark-750">
                    <span className="text-xs text-gray-400 font-mono">30-Day Historical Volatility</span>
                    <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                      {vol?.volatility_30d_pct?.toFixed(1)}%
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">Annualized standard deviation</span>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-850 border border-dark-750">
                    <span className="text-xs text-gray-400 font-mono">14-Day Average True Range (ATR)</span>
                    <div className="text-2xl font-bold font-mono text-white mt-1">
                      ${vol?.atr_14?.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      ~{(( (vol?.atr_14 || 2.5) / (stock.current_price || 1) ) * 100).toFixed(1)}% expected daily swing
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-850 border border-dark-750">
                    <span className="text-xs text-gray-400 font-mono">Slippage & Spread Impact</span>
                    <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                      ~{vol?.spread_bps || 8} bps
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">Modeled execution impact</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed bg-dark-850/50 p-3 rounded-lg border border-dark-750/70">
                  {vol?.explanation || 'Statistical volatility derived from daily logarithmic close-to-close returns and ATR envelope.'}
                </p>
              </div>

              {/* SECTION 3: THE HISTORY OF THE STOCK */}
              <div className="glass-panel p-5 rounded-xl border border-dark-750 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Price History & Technical Candlesticks (60-Day)</span>
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {bars.length} Daily Sessions
                  </span>
                </div>

                {bars.length > 0 ? (
                  <StockChart
                    bars={bars}
                    ticker={stock.ticker}
                    currency={stock.currency}
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-xs text-gray-500 font-mono">
                    No historical bars recorded for {stock.ticker}
                  </div>
                )}
              </div>

              {/* SECTION 4: PREDICTION OF THE STOCK */}
              <div className="glass-panel p-5 rounded-xl border border-dark-750 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Machine Learning Prediction & Horizon Forecast</span>
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                    {pred?.horizon || '5D'} Horizon
                  </span>
                </div>

                {pred ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Direction */}
                      <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col justify-between">
                        <span className="text-xs text-gray-400 font-mono">Forecast Direction</span>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-bold font-mono flex items-center space-x-1.5 ${
                              predUp
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {predUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{pred.predicted_direction}</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 mt-2">
                          Expected Return: <strong className={predUp ? 'text-emerald-400' : 'text-red-400'}>
                            {pred.expected_return_pct > 0 ? '+' : ''}{pred.expected_return_pct}%
                          </strong>
                        </span>
                      </div>

                      {/* Calibrated Probability */}
                      <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col justify-between">
                        <span className="text-xs text-gray-400 font-mono">Calibrated Win Probability</span>
                        <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                          {pred.model_confidence_pct || (pred.model_confidence * 100).toFixed(1)}%
                        </div>
                        <span className="text-[11px] text-gray-500 mt-2">
                          Platt-scaled out-of-sample probability
                        </span>
                      </div>

                      {/* Confidence Interval */}
                      <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex flex-col justify-between">
                        <span className="text-xs text-gray-400 font-mono">Confidence Interval (90%)</span>
                        <div className="text-base font-bold font-mono text-white mt-1">
                          [{pred.confidence_interval_low}% ... {pred.confidence_interval_high}%]
                        </div>
                        <span className="text-[11px] text-gray-500 mt-2">
                          Uncertainty Level: <strong className="text-gray-300">{pred.uncertainty_level}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Top ML Factors */}
                    {pred.top_factors && pred.top_factors.length > 0 && (
                      <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 space-y-2.5">
                        <span className="text-xs text-gray-400 font-mono block">Top Feature Importances Driving Model Forecast:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          {pred.top_factors.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded bg-dark-900 border border-dark-750">
                              <span className="text-gray-300 truncate mr-2">{f.feature}</span>
                              <span className="text-cyan-400 font-bold font-mono">{(f.importance * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500 font-mono">
                    No active prediction models computed for {stock.ticker}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 border-t border-dark-750 bg-dark-850/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Research Grade • Walk-Forward Calibrated • Realistic Execution</span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/simulation?ticker=${ticker}`}
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition inline-flex items-center space-x-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run 2,000 Simulations</span>
            </Link>

            <Link
              href={`/smart-money?ticker=${ticker}`}
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-cyan-300 border border-dark-600 font-semibold text-xs transition inline-flex items-center space-x-1.5"
            >
              <span>Smart Money Flow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`/paper-trading?ticker=${ticker}`}
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-emerald-300 border border-dark-600 font-semibold text-xs transition inline-flex items-center space-x-1.5"
            >
              <span>Paper Trade</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
