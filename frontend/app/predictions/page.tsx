'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { AIPrediction, Stock } from '../../lib/types';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

function PredictionsContent() {
  const searchParams = useSearchParams();
  const queryTicker = searchParams.get('ticker') || 'NVDA';

  const [selectedTicker, setSelectedTicker] = useState(queryTicker);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      setLoading(true);
      try {
        const data = await api.getPredictions(selectedTicker);
        setPredictions(data);
      } catch (err) {
        console.error('Failed to load predictions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPredictions();
  }, [selectedTicker]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Machine Learning Forecasts & Return Distributions</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Time-series purged/embargoed models with confidence intervals and calibrated probabilities.
          </p>
        </div>

        {/* Ticker Selector */}
        <div className="flex items-center space-x-2">
          {['NVDA', 'PLTR', 'AAPL', 'SHOP.TO', 'TSLA'].map((t) => (
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

      {/* Bias Prevention Protocol Note */}
      <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex items-start space-x-3 text-xs text-gray-300">
        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Scientific Validation Guarantee:</strong> All predictions use walk-forward evaluation, purged/embargoed cross-validation splits, and out-of-sample testing. Strictly prohibits look-ahead bias, survivorship bias, and training on post-facto revised fundamentals. When model confidence fails calibration thresholds, the system explicitly <strong>abstains</strong>.
        </div>
      </div>

      {/* Predictions Horizons Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-gray-500 font-mono">
          Evaluating predictive models for {selectedTicker}...
        </div>
      ) : predictions.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-500 glass-panel rounded-xl">
          No prediction models generated for {selectedTicker}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions.map((p, idx) => {
            const isUp = p.predicted_direction === 'UP';
            const isDown = p.predicted_direction === 'DOWN';

            return (
              <div key={idx} className="glass-panel rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-dark-750">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold font-mono text-white">{p.ticker}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-dark-800 text-gray-300 font-mono">
                        {p.horizon} Horizon
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {isUp && (
                        <span className="flex items-center space-x-1 text-xs font-bold font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>BULLISH</span>
                        </span>
                      )}
                      {isDown && (
                        <span className="flex items-center space-x-1 text-xs font-bold font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>BEARISH</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Return Distribution & Confidence Interval */}
                  <div className="my-4 p-4 rounded-lg bg-dark-850 border border-dark-750 font-mono">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                      Expected Return & Confidence Interval
                    </span>
                    <div className="text-2xl font-bold text-white mb-2">
                      {p.expected_return_pct >= 0 ? '+' : ''}{p.expected_return_pct.toFixed(2)}%
                    </div>

                    {/* CI Visual Band */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-400">
                        <span>CI Lower: <strong className="text-red-400">{p.confidence_interval_low.toFixed(2)}%</strong></span>
                        <span>CI Upper: <strong className="text-emerald-400">+{p.confidence_interval_high.toFixed(2)}%</strong></span>
                      </div>
                      <div className="h-2 w-full bg-dark-750 rounded-full overflow-hidden flex">
                        <div className="bg-red-500/80 h-full w-1/3"></div>
                        <div className="bg-emerald-500/80 h-full w-2/3"></div>
                      </div>
                    </div>
                  </div>

                  {/* Model Confidence, Uncertainty & Volatility */}
                  {(() => {
                    const volMap: Record<string, number> = {
                      ANT: 9, TSLA: 9, PLTR: 8, 'SHOP.TO': 7, AMD: 7,
                      NVDA: 6, MSFT: 4, AMZN: 4, AAPL: 3, 'TD.TO': 3,
                      'RY.TO': 2, 'ENB.TO': 2, SPY: 1
                    };
                    const volScore = volMap[p.ticker] ?? (p.uncertainty_level === 'High' ? 8 : p.uncertainty_level === 'Moderate' ? 5 : 2);
                    const volColor =
                      volScore <= 3
                        ? 'text-emerald-400'
                        : volScore <= 6
                        ? 'text-amber-300'
                        : volScore <= 8
                        ? 'text-orange-400'
                        : 'text-rose-400';

                    return (
                      <div className="grid grid-cols-3 gap-3 mb-4 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-750">
                          <span className="text-[10px] text-gray-400 uppercase block">Model Confidence</span>
                          <span className="text-sm font-bold text-cyan-400">{(p.model_confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-750">
                          <span className="text-[10px] text-gray-400 uppercase block">Uncertainty</span>
                          <span className="text-sm font-bold text-amber-400">{p.uncertainty_level}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-dark-850 border border-dark-750">
                          <span className="text-[10px] text-gray-400 uppercase block">Volatility (1-10)</span>
                          <span className={`text-sm font-bold ${volColor}`}>{volScore}/10</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Feature Importance Attribution */}
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 font-mono">
                      Top Explanation Factors
                    </span>
                    <div className="space-y-2">
                      {p.top_factors.map((f, i) => (
                        <div key={i} className="text-xs">
                          <div className="flex justify-between text-gray-300 mb-0.5">
                            <span>{f.feature}</span>
                            <span className="font-mono text-cyan-400">{(f.importance * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-dark-750 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-full"
                              style={{ width: `${f.importance * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-dark-750 text-[11px] text-gray-500 font-mono flex items-center justify-between">
                  <span>Status: {p.is_abstained ? 'Abstained (Low Confidence)' : 'Active Prediction'}</span>
                  <span>Purged Split v1.4</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500 font-mono">Loading forecasts...</div>}>
      <PredictionsContent />
    </Suspense>
  );
}
