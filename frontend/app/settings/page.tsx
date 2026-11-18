'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ProvidersSummary } from '../../lib/types';
import { ShieldCheck, Settings, CheckCircle2, AlertTriangle, Key, Terminal, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [status, setStatus] = useState<ProvidersSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        const data = await api.getProvidersStatus();
        setStatus(data);
      } catch (err) {
        console.error('Failed to load provider status:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <span>System Settings & Data Providers</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Monitor connection health, environment configuration, and risk management parameters.
        </p>
      </div>

      {/* Demo Status Banner */}
      {status?.is_demo_mode && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-start space-x-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Running in DEMO DATA Mode:</strong> One or more market data provider keys are absent or set to placeholders in <code>.env</code>. The platform is running with realistic synthetic historical and premarket data feeds. Live brokerage execution is locked out.
          </div>
        </div>
      )}

      {/* Provider Connection Grid */}
      <div className="glass-panel p-6 rounded-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Market Data & AI Provider Adapters</span>
        </h2>

        {loading ? (
          <div className="h-40 flex items-center justify-center text-xs text-gray-500 font-mono">
            Checking provider connectivity...
          </div>
        ) : (
          <div className="divide-y divide-dark-750">
            {status?.providers.map((p) => {
              const isConnected = p.status === 'CONNECTED' || p.status === 'ACTIVE' || p.status === 'READY';
              return (
                <div key={p.name} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{p.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-dark-850 text-gray-400">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{p.notes}</p>
                  </div>

                  <div className="flex items-center space-x-3 self-start sm:self-center">
                    <span className="text-xs font-mono text-gray-400">{p.mode}</span>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border ${
                      isConnected
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Risk Controls Configuration */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Execution Risk Controls & Policy</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 uppercase block font-sans">Live Trading Engine</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block">LOCKED (PAPER ONLY)</span>
            <span className="text-[10px] text-gray-500 font-sans mt-1 block">
              Hard lockout prevents accidental live orders.
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 uppercase block font-sans">Single Position Cap</span>
            <span className="text-sm font-bold text-cyan-400 mt-1 block">MAX 25.0% EQUITY</span>
            <span className="text-[10px] text-gray-500 font-sans mt-1 block">
              Prevents concentrated capital exposure.
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-dark-850 border border-dark-750">
            <span className="text-[10px] text-gray-400 uppercase block font-sans">Slippage Tolerance</span>
            <span className="text-sm font-bold text-amber-400 mt-1 block">15 BPS (0.15%)</span>
            <span className="text-[10px] text-gray-500 font-sans mt-1 block">
              Orders rejected if estimated spread exceeds threshold.
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Instructions */}
      <div className="glass-panel p-6 rounded-xl space-y-3">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <span>How to Connect Live Production Keys</span>
        </h2>

        <p className="text-xs text-gray-300 leading-relaxed font-sans">
          To transition from DEMO DATA to live verified market feeds, edit the <code>.env</code> file in your project root on this Windows computer. Keys are read securely on the backend server and are never exposed to the frontend browser or committed to Git.
        </p>

        <div className="p-3 rounded-lg bg-dark-900 border border-dark-700 font-mono text-[11px] text-gray-300 space-y-1">
          <div>ALPACA_API_KEY=your_actual_alpaca_key</div>
          <div>ALPACA_SECRET_KEY=your_actual_alpaca_secret</div>
          <div>MASSIVE_API_KEY=your_polygon_key</div>
          <div>ANTHROPIC_API_KEY=your_anthropic_key</div>
          <div>TELEGRAM_BOT_TOKEN=your_telegram_bot_token</div>
        </div>
      </div>
    </div>
  );
}
