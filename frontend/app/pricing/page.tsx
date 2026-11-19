'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { TierPlan } from '../../lib/types';
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight, RefreshCw, Star } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [plans, setPlans] = useState<TierPlan[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('PRO');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadTiers = async () => {
    try {
      const data = await api.getTierPlans();
      setPlans(data.plans);
      setCurrentTier(data.current_tier);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  const handleSwitchTier = async (tierId: string) => {
    setSwitching(tierId);
    setFeedbackMsg(null);
    try {
      const res = await api.switchTier(tierId);
      setCurrentTier(tierId);
      setFeedbackMsg(`Successfully switched active plan to ${res.plan.name}!`);
      await loadTiers();
    } catch (err: any) {
      alert(`Tier switch failed: ${err.message}`);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FLEXIBLE PLATFORM TIERS</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Transparent Intelligence Tiers for Every Quantitative Trader
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          From individual investors running basic screens to quantitative funds executing 2,000+ stochastic future price simulations.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-3 pt-2 text-xs font-sans">
          <span className={billingCycle === 'monthly' ? 'text-white font-bold' : 'text-gray-400'}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 rounded-full bg-dark-800 p-1 border border-dark-700 relative transition"
          >
            <div
              className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={billingCycle === 'annual' ? 'text-white font-bold flex items-center space-x-1' : 'text-gray-400'}>
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              SAVE 20%
            </span>
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono text-center">
          ✓ {feedbackMsg}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const price = billingCycle === 'annual' ? plan.annual_price : plan.monthly_price;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'glass-panel border-cyan-500/50 shadow-xl shadow-cyan-950/30'
                  : 'glass-panel border-dark-750'
              } ${isCurrent ? 'ring-2 ring-cyan-400' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-[10px] font-bold text-white uppercase tracking-wider font-mono shadow-md">
                  MOST POPULAR
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{plan.tagline}</p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="my-6">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-white font-mono">${price}</span>
                    <span className="text-xs text-gray-400 font-sans">/ month</span>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-1">
                    {billingCycle === 'annual' && price > 0 ? 'Billed annually' : 'Billed monthly'}
                  </span>
                </div>

                {/* Simulation Cap Highlight */}
                <div className="p-3 rounded-lg bg-dark-850 border border-dark-750 mb-6 text-xs font-mono">
                  <div className="flex justify-between text-gray-300">
                    <span>Monte Carlo Limit:</span>
                    <span className="font-bold text-cyan-400">{plan.max_simulations.toLocaleString()} runs</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px] mt-1">
                    <span>Forward Horizon:</span>
                    <span className="text-white">{plan.max_simulation_horizon_days} trading days</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs text-gray-300 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button: Switches Active Tier in Demo Mode */}
              <div>
                <button
                  onClick={() => handleSwitchTier(plan.id)}
                  disabled={isCurrent || switching === plan.id}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold font-sans transition flex items-center justify-center space-x-2 ${
                    isCurrent
                      ? 'bg-dark-800 text-gray-400 border border-dark-700 cursor-default'
                      : plan.popular
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-dark-800 hover:bg-dark-750 text-white border border-dark-700'
                  }`}
                >
                  {switching === plan.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : isCurrent ? (
                    <span>Current Active Plan</span>
                  ) : (
                    <>
                      <span>Switch to {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <span className="text-[10px] text-gray-500 block text-center mt-2 font-mono">
                  Demo Mode: Instant 1-click active tier testing
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white">Full Feature Comparison Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-dark-850 text-gray-400 uppercase border-b border-dark-750">
              <tr>
                <th className="p-3">Platform Capability</th>
                <th className="p-3 text-center">Explorer (Free)</th>
                <th className="p-3 text-center text-cyan-400">Quantitative (Pro)</th>
                <th className="p-3 text-center">Institutional Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750 text-gray-300">
              <tr>
                <td className="p-3 font-sans text-white">Monte Carlo Simulation Runs</td>
                <td className="p-3 text-center text-amber-400 font-bold">100 runs</td>
                <td className="p-3 text-center text-cyan-400 font-bold">2,000 runs</td>
                <td className="p-3 text-center text-emerald-400 font-bold">10,000 runs</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">Forward Prediction Horizon</td>
                <td className="p-3 text-center">20 Days</td>
                <td className="p-3 text-center text-cyan-400 font-bold">90 Days</td>
                <td className="p-3 text-center">252 Days (1 Year)</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">Universe Coverage</td>
                <td className="p-3 text-center">Top 5 Equities</td>
                <td className="p-3 text-center text-cyan-400 font-bold">Full NYSE, NASDAQ & TSX</td>
                <td className="p-3 text-center">Full + Custom Universe</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">5:00 AM Morning Market Brief</td>
                <td className="p-3 text-center">Top 3 Preview</td>
                <td className="p-3 text-center text-cyan-400 font-bold">Full Top 10 + SHA256</td>
                <td className="p-3 text-center">Full Top 50 + Custom</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">Pre-Open 9:15 AM Signal Refresh</td>
                <td className="p-3 text-center text-gray-600">—</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">Dark Pool & FINRA Off-Exchange Proxy</td>
                <td className="p-3 text-center text-gray-600">—</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">SEC Form 13F Institutional Tracker</td>
                <td className="p-3 text-center text-gray-600">—</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">Telegram Alerts & Risk Warnings</td>
                <td className="p-3 text-center text-gray-600">—</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled + Webhooks</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">Simulated Paper Trading</td>
                <td className="p-3 text-center">3 orders / day</td>
                <td className="p-3 text-center text-cyan-400 font-bold">Unlimited</td>
                <td className="p-3 text-center text-cyan-400 font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3 font-sans text-white">Event-Driven Walk-Forward Backtester</td>
                <td className="p-3 text-center text-gray-600">—</td>
                <td className="p-3 text-center text-emerald-400">✓ Enabled</td>
                <td className="p-3 text-center text-emerald-400">✓ Custom Tuning</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Launch & Simulation Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 border border-cyan-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Ready to test the 2,000-path Monte Carlo simulator?</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Pick any stock (e.g. NVDA or SHOP.TO) and evaluate forward probability cones with smart money flow drift.
          </p>
        </div>
        <Link
          href="/simulation"
          className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-bold text-xs shadow-lg transition flex items-center space-x-1.5 self-start sm:self-center"
        >
          <span>Open Simulation Area</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
