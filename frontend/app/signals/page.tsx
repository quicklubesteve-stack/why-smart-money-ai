'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { TradingSignal } from '../../lib/types';
import { Zap, CheckCircle2, AlertOctagon, ArrowRight, ShieldCheck, Scale, Info } from 'lucide-react';
import Link from 'next/link';

export default function SignalsPage() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRec, setFilterRec] = useState<string>('ALL');

  useEffect(() => {
    async function fetchSignals() {
      setLoading(true);
      try {
        const params: any = {};
        if (filterRec !== 'ALL') params.recommendation = filterRec;
        const data = await api.getSignals(params);
        setSignals(data);
      } catch (err) {
        console.error('Failed to load signals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, [filterRec]);

  const recBadgeColor = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'WATCH':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'HOLD':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'AVOID':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'SELL/EXIT':
        return 'bg-purple-950 text-purple-400 border-purple-800';
      default:
        return 'bg-dark-800 text-gray-300 border-dark-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Algorithmic Trading Signals</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              CALIBRATED MULTI-FACTOR
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Grounded recommendations with explicit entry zones, stop losses, R:R ratios, expected slippage, and invalidation rules.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-dark-900 p-1 rounded-lg border border-dark-700 text-xs font-mono">
          {['ALL', 'BUY', 'WATCH', 'HOLD', 'AVOID'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRec(r)}
              className={`px-3 py-1.5 rounded-md transition ${
                filterRec === r
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Methodological Guidance Note */}
      <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-750 flex items-start space-x-3 text-xs text-gray-300">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Signal Quality Score vs Calibrated Probability:</strong> The Signal Quality Score (0-100) measures institutional indicator confluence and setup cleanliness. The Calibrated Probability (e.g. 68%) is an out-of-sample empirical estimate derived via Platt scaling. Signals automatically abstain when confidence intervals are too wide.
        </div>
      </div>

      {/* Signal Cards Grid */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-xs text-gray-500 font-mono">
          Loading algorithmic signals...
        </div>
      ) : signals.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-500 glass-panel rounded-xl">
          No trading signals match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {signals.map((sig) => (
            <div key={sig.id} className="glass-panel rounded-xl p-5 flex flex-col justify-between hover:border-dark-600 transition">
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between pb-3 border-b border-dark-750">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold font-mono text-white">{sig.ticker}</span>
                      <span className="text-xs text-gray-400">({sig.exchange})</span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${recBadgeColor(sig.recommendation)}`}>
                        {sig.recommendation}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{sig.name}</span>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">
                      ${sig.latest_quote.toFixed(2)} <span className="text-xs text-gray-400">{sig.currency}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Horizon: {sig.horizon}</span>
                  </div>
                </div>

                {/* Quantitative Metric Grid */}
                <div className="grid grid-cols-3 gap-2.5 my-4 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-750">
                    <span className="text-[10px] text-gray-400 block uppercase">Quality Score</span>
                    <span className="text-sm font-bold text-cyan-400">{sig.quality_score.toFixed(1)}/100</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-750">
                    <span className="text-[10px] text-gray-400 block uppercase">Calibrated Prob</span>
                    <span className="text-sm font-bold text-emerald-400">{(sig.calibrated_prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-750">
                    <span className="text-[10px] text-gray-400 block uppercase">Reward / Risk</span>
                    <span className="text-sm font-bold text-amber-400">{sig.risk_reward_ratio.toFixed(1)}:1</span>
                  </div>
                </div>

                {/* Execution Plan Levels */}
                <div className="p-3 rounded-lg bg-dark-850 border border-dark-750 space-y-1.5 text-xs font-mono mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Zone:</span>
                    <span className="text-gray-200 font-bold">${sig.entry_zone_min.toFixed(2)} - ${sig.entry_zone_max.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Scenario:</span>
                    <span className="text-emerald-400 font-bold">${sig.target_price.toFixed(2)} (+{(((sig.target_price - sig.latest_quote) / sig.latest_quote) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400 font-bold">${sig.stop_loss.toFixed(2)} (-{(((sig.latest_quote - sig.stop_loss) / sig.latest_quote) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dark-700 text-[11px]">
                    <span className="text-gray-500">Est. Slippage Buffer:</span>
                    <span className="text-gray-400 font-sans">~{sig.estimated_slippage_bps} bps</span>
                  </div>
                </div>

                {/* Invalidation Rules */}
                {sig.invalidation_rule && (
                  <div className="mb-4 text-xs text-amber-300/90 bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-lg flex items-start space-x-2">
                    <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                    <span><strong>Invalidation:</strong> {sig.invalidation_rule}</span>
                  </div>
                )}

                {/* Evidence Pro & Con */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider block mb-1">
                      Evidence Pro:
                    </span>
                    {sig.evidence_pro.map((p, i) => (
                      <div key={i} className="flex items-start space-x-1.5 text-gray-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  {sig.evidence_con && sig.evidence_con.length > 0 && (
                    <div className="pt-2">
                      <span className="font-semibold text-red-400 text-[11px] uppercase tracking-wider block mb-1">
                        Risk Considerations:
                      </span>
                      {sig.evidence_con.map((c, i) => (
                        <div key={i} className="flex items-start space-x-1.5 text-gray-400">
                          <span className="text-red-400">•</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-dark-750 flex items-center justify-between text-xs">
                <Link
                  href={`/smart-money?ticker=${sig.ticker}`}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>Flow Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/paper-trading?tradeTicker=${sig.ticker}&side=${sig.recommendation === 'BUY' ? 'BUY' : 'SELL'}&limit=${sig.entry_zone_max}`}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-200 border border-dark-600 transition"
                >
                  Simulate Paper Trade
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
