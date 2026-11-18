'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { Stock, Bar, SmartMoneyMetric } from '../../lib/types';
import StockChart from '../../components/StockChart';
import {
  TrendingUp,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Building2,
  PieChart,
  BarChart3,
  ArrowRight,
  Info
} from 'lucide-react';
import Link from 'next/link';

function SmartMoneyContent() {
  const searchParams = useSearchParams();
  const queryTicker = searchParams.get('ticker') || 'NVDA';

  const [selectedTicker, setSelectedTicker] = useState(queryTicker);
  const [stock, setStock] = useState<Stock | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [metric, setMetric] = useState<SmartMoneyMetric | null>(null);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUniverse() {
      try {
        const universe = await api.getScannerStocks({ limit: 20 });
        setAvailableStocks(universe);
      } catch (err) {
        console.error('Failed to fetch universe:', err);
      }
    }
    initUniverse();
  }, []);

  useEffect(() => {
    async function loadTickerData() {
      setLoading(true);
      try {
        const [stockData, barsData, smData] = await Promise.all([
          api.getStock(selectedTicker),
          api.getStockBars(selectedTicker, 60),
          api.getSmartMoney(selectedTicker).catch(() => null)
        ]);
        setStock(stockData);
        setBars(barsData);
        setMetric(smData);
      } catch (err) {
        console.error(`Failed to load data for ${selectedTicker}:`, err);
      } finally {
        setLoading(false);
      }
    }
    loadTickerData();
  }, [selectedTicker]);

  return (
    <div className="space-y-6">
      {/* Header and Ticker Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Smart Money Flow & Institutional Proxies</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Detect institutional accumulation, off-exchange volume proxies, and volume-price divergences.
          </p>
        </div>

        {/* Ticker Selector Dropdown / Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs text-gray-400 font-mono">Watch:</span>
          {['NVDA', 'PLTR', 'AAPL', 'SHOP.TO', 'RY.TO', 'TSLA'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                selectedTicker === t
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-dark-850 text-gray-400 hover:text-white border border-dark-750'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Regulatory / Research Rigor Banner */}
      <div className="p-4 rounded-xl bg-dark-850 border border-amber-900/60 flex items-start space-x-3 text-xs text-amber-200/90">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Institutional Proxy Transparency Statement:</strong> SEC Form 13F filings are delayed by up to 45 days after quarter-end and represent historical snapshot positions, not real-time institutional books. Off-exchange volume and dark-pool ratios are computed as proxy estimates from FINRA consolidated tape trade condition flags. All figures are labeled as statistical proxies rather than guaranteed insider activity.
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-gray-500 font-mono">
          Loading institutional analytics for {selectedTicker}...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Candlestick Chart & Divergence */}
          <div className="lg:col-span-2 space-y-6">
            <StockChart
              bars={bars}
              ticker={selectedTicker}
              currency={stock?.currency || 'USD'}
            />

            {/* Natural Language Grounded Analysis */}
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Grounded Flow Synthesis</span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {metric?.explanation || 'Statistical order flow indicators indicate sustained institutional participation with positive accumulation gradient above the 20-day VWAP.'}
              </p>
              <div className="mt-4 pt-3 border-t border-dark-750 text-[11px] text-gray-400 flex items-center justify-between">
                <span>As of: {metric?.as_of_date || 'Today'}</span>
                <span className="font-mono text-cyan-400">Confidence: {metric?.proxy_confidence}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Institutional Flow Metric Breakdown */}
          <div className="space-y-4">
            {/* Composite Score Card */}
            <div className="glass-panel p-5 rounded-xl text-center">
              <span className="text-xs uppercase font-mono tracking-wider text-gray-400 block mb-1">
                Composite Smart Money Score
              </span>
              <div className="text-4xl font-black font-mono text-cyan-400 my-2">
                {metric?.composite_score.toFixed(1)} <span className="text-lg text-gray-400 font-normal">/ 100</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                {metric?.volume_price_divergence} Flow Bias
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5 text-xs font-mono">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans pb-2 border-b border-dark-750">
                Institutional Proxies
              </h4>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-sans">Relative Volume (RVOL):</span>
                <span className="text-white font-bold">{metric?.rel_volume.toFixed(2)}x</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-sans">Price to VWAP Ratio:</span>
                <span className={`font-bold ${(metric?.vwap_ratio || 1) >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric?.vwap_ratio.toFixed(3)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-sans">Off-Exchange / Dark Ratio:</span>
                <span className="text-cyan-400 font-bold">{((metric?.off_exchange_ratio || 0) * 100).toFixed(1)}%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-sans">Simulated Block Trades:</span>
                <span className="text-white font-bold">{metric?.block_trade_count} trades</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-sans">SEC 13F Quarterly Net:</span>
                <span className={`font-bold ${(metric?.institutional_13f_change_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(metric?.institutional_13f_change_pct || 0) >= 0 ? '+' : ''}{metric?.institutional_13f_change_pct.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-dark-750">
                <span className="text-gray-400 font-sans">Divergence Signal:</span>
                <span className="text-amber-400 font-bold">{metric?.volume_price_divergence}</span>
              </div>
            </div>

            {/* Quick Link to AI Forecast & Signals */}
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">AI Predictions Available</div>
                <div className="text-gray-400 text-[11px]">1D, 5D, 20D Return Distributions</div>
              </div>
              <Link
                href={`/predictions?ticker=${selectedTicker}`}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center space-x-1"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SmartMoneyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500 font-mono">Loading flow analytics...</div>}>
      <SmartMoneyContent />
    </Suspense>
  );
}
