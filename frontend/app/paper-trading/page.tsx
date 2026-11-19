'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { PortfolioSummary, PaperOrder } from '../../lib/types';
import MetricCard from '../../components/MetricCard';
import { ShieldCheck, ShieldAlert, ArrowUpDown, CheckCircle2, AlertOctagon, RefreshCw, Send } from 'lucide-react';

function PaperTradingContent() {
  const searchParams = useSearchParams();
  const initTicker = searchParams.get('tradeTicker') || 'NVDA';
  const initSide = searchParams.get('side') || 'BUY';
  const initLimit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Trade Form State
  const [ticker, setTicker] = useState(initTicker);
  const [side, setSide] = useState(initSide);
  const [shares, setShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number | undefined>(initLimit);
  const [confirmSimulation, setConfirmSimulation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradeMessage(null);

    if (!confirmSimulation) {
      setTradeMessage({
        type: 'error',
        text: 'Please check the box to confirm execution in the realistic paper simulator.'
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.submitPaperTrade({
        ticker,
        side,
        shares,
        limit_price: limitPrice,
        confirm_paper_trading: true
      });

      setTradeMessage({
        type: 'success',
        text: `Successfully executed paper ${side} order for ${shares} shares of ${ticker}.`
      });

      // Reload portfolio
      await loadPortfolio();
    } catch (err: any) {
      setTradeMessage({
        type: 'error',
        text: err.message || 'Failed to execute paper order'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Realistic Paper Trading Simulator</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              INTERNAL ENGINE
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Simulates market orders, bid-ask spreads, realistic slippage (5-15 bps), trading fees, and position sizing guardrails.
          </p>
        </div>

        <button
          onClick={loadPortfolio}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-700 text-xs text-gray-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Balances</span>
        </button>
      </div>

      {/* Safety Notice: Live Orders Blocked */}
      <div className="p-4 rounded-xl bg-dark-850 border border-emerald-900/60 flex items-start space-x-3 text-xs text-emerald-200/90">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Execution Safety Guarantee:</strong> Real brokerage orders cannot be sent without explicit user opt-in and live credentials. In this initial release, live trading is permanently locked out. All trades execute in realistic internal paper simulation with simulated bid-ask slippage.
        </div>
      </div>

      {/* Account Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Equity"
          value={`$${portfolio ? portfolio.total_equity.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '100,000.00'}`}
          subtitle={`${portfolio?.currency || 'USD'} Simulated Portfolio`}
          badge="NET WORTH"
          badgeColor="cyan"
        />
        <MetricCard
          title="Cash Balance"
          value={`$${portfolio ? portfolio.cash_balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '72,450.00'}`}
          subtitle="Available for allocation"
          badge="LIQUID CASH"
          badgeColor="indigo"
        />
        <MetricCard
          title="Positions Value"
          value={`$${portfolio ? portfolio.positions_value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '27,550.00'}`}
          subtitle={`${portfolio?.positions.length || 0} Open Holdings`}
          badge="INVESTED"
          badgeColor="emerald"
        />
        <MetricCard
          title="Unrealized P&L"
          value={`$${portfolio ? portfolio.total_unrealized_pnl.toFixed(2) : '0.00'}`}
          change={portfolio && portfolio.total_equity > 0 ? (portfolio.total_unrealized_pnl / portfolio.total_equity * 100) : 0}
          changeLabel="Total Open P&L"
          badge="P&L"
          badgeColor="emerald"
        />
      </div>

      {/* Two Column Layout: Order Entry Form & Open Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Entry Form */}
        <div className="glass-panel p-5 rounded-xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>Place Simulated Paper Order</span>
          </h2>

          <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs font-mono">
            {/* Ticker & Side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-sans">Ticker Symbol</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-700 text-white font-bold uppercase focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-sans">Side</label>
                <div className="grid grid-cols-2 gap-1 bg-dark-900 p-1 rounded-lg border border-dark-700">
                  <button
                    type="button"
                    onClick={() => setSide('BUY')}
                    className={`py-1.5 rounded font-bold transition ${
                      side === 'BUY'
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('SELL')}
                    className={`py-1.5 rounded font-bold transition ${
                      side === 'SELL'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>
            </div>

            {/* Shares & Limit Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1 font-sans">Shares</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={shares}
                  onChange={(e) => setShares(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-700 text-white font-bold focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-sans">Limit Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Market Price"
                  value={limitPrice !== undefined ? limitPrice : ''}
                  onChange={(e) => setLimitPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Confirmation Guardrail Checkbox */}
            <div className="pt-2">
              <label className="flex items-start space-x-2 cursor-pointer text-gray-300 font-sans">
                <input
                  type="checkbox"
                  checked={confirmSimulation}
                  onChange={(e) => setConfirmSimulation(e.target.checked)}
                  className="rounded bg-dark-900 border-dark-700 text-cyan-500 focus:ring-0 mt-0.5"
                />
                <span className="text-[11px] leading-tight">
                  I understand this executes in internal paper simulation with simulated bid-ask slippage.
                </span>
              </label>
            </div>

            {/* Status Message */}
            {tradeMessage && (
              <div className={`p-3 rounded-lg text-xs font-sans ${
                tradeMessage.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950/80 text-red-300 border border-red-800'
              }`}>
                {tradeMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-bold shadow-lg transition disabled:opacity-50"
            >
              {submitting ? 'Executing Simulated Fill...' : `Submit Paper ${side} Order`}
            </button>
          </form>
        </div>

        {/* Current Positions */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4">Open Paper Positions</h2>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-xs text-gray-500 font-mono">
                Loading paper positions...
              </div>
            ) : !portfolio || portfolio.positions.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 font-sans">
                No active positions currently in paper account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-dark-850 text-gray-400 uppercase border-b border-dark-750">
                    <tr>
                      <th className="p-3">Ticker</th>
                      <th className="p-3 text-right">Shares</th>
                      <th className="p-3 text-right">Avg Cost</th>
                      <th className="p-3 text-right">Market Price</th>
                      <th className="p-3 text-right">Market Value</th>
                      <th className="p-3 text-right">Unrealized P&L</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-750">
                    {portfolio.positions.map((pos) => {
                      const isUp = pos.unrealized_pnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-dark-800/50">
                          <td className="p-3 font-bold text-white text-sm">
                            <div className="flex items-center space-x-1.5">
                              <span>{pos.ticker}</span>
                              <span className="text-[10px] text-gray-400 font-normal">({pos.currency})</span>
                              {(() => {
                                const volMap: Record<string, number> = {
                                  ANT: 9, TSLA: 9, PLTR: 8, 'SHOP.TO': 7, AMD: 7,
                                  NVDA: 6, MSFT: 4, AMZN: 4, AAPL: 3, 'TD.TO': 3,
                                  'RY.TO': 2, 'ENB.TO': 2, SPY: 1
                                };
                                const v = volMap[pos.ticker] ?? 5;
                                const c = v <= 3 ? 'text-emerald-400 border-emerald-800' : v <= 6 ? 'text-amber-300 border-amber-800' : v <= 8 ? 'text-orange-400 border-orange-800' : 'text-rose-400 border-rose-800';
                                return (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded border bg-dark-900 ${c}`}>
                                    Vol {v}/10
                                  </span>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="p-3 text-right text-gray-200">{pos.shares}</td>
                          <td className="p-3 text-right text-gray-300">${pos.average_entry_price.toFixed(2)}</td>
                          <td className="p-3 text-right text-white font-bold">${pos.current_price.toFixed(2)}</td>
                          <td className="p-3 text-right text-gray-200">
                            ${(pos.shares * pos.current_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`p-3 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}${pos.unrealized_pnl.toFixed(2)} ({isUp ? '+' : ''}{pos.unrealized_pnl_pct.toFixed(2)}%)
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={async () => {
                                if (confirm(`Close entire position of ${pos.shares} shares in ${pos.ticker}?`)) {
                                  try {
                                    await api.closePaperPosition(pos.ticker);
                                    await loadPortfolio();
                                    setTradeMessage({
                                      type: 'success',
                                      text: `Closed ${pos.ticker} position at market price with simulated slippage.`
                                    });
                                  } catch (err: any) {
                                    alert(`Close failed: ${err.message}`);
                                  }
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[11px] font-sans font-bold transition"
                            >
                              Exit Market
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Order Execution Log */}
      <div className="glass-panel p-5 rounded-xl">
        <h2 className="text-base font-bold text-white mb-4">Simulated Execution Audit Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-dark-850 text-gray-400 uppercase border-b border-dark-750">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Ticker</th>
                <th className="p-3">Side</th>
                <th className="p-3 text-right">Shares</th>
                <th className="p-3 text-right">Executed Price</th>
                <th className="p-3 text-right">Slippage</th>
                <th className="p-3 text-right">Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750">
              {!portfolio || portfolio.recent_orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500 font-sans">
                    No order history recorded yet.
                  </td>
                </tr>
              ) : (
                portfolio.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-dark-800/40">
                    <td className="p-3 text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold text-white">{order.ticker}</td>
                    <td className={`p-3 font-bold ${order.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {order.side}
                    </td>
                    <td className="p-3 text-right text-gray-200">{order.shares}</td>
                    <td className="p-3 text-right font-bold text-white">
                      ${order.executed_price ? order.executed_price.toFixed(2) : order.requested_price.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-amber-400">{order.slippage_bps} bps</td>
                    <td className="p-3 text-right text-gray-400">${order.fee_paid.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-gray-400 truncate max-w-xs">{order.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PaperTradingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500 font-mono">Loading simulator...</div>}>
      <PaperTradingContent />
    </Suspense>
  );
}
