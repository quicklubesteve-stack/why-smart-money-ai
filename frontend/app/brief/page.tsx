'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MarketBrief } from '../../lib/types';
import { Sunrise, Clock, ShieldCheck, AlertTriangle, Hash, ExternalLink, Calendar, CheckCircle, Play, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MarketBriefPage() {
  const [brief, setBrief] = useState<MarketBrief | null>(null);
  const [history, setHistory] = useState<MarketBrief[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function loadData() {
    try {
      const [latest, past, sched] = await Promise.all([
        api.getLatestBrief().catch(() => null),
        api.getBriefHistory().catch(() => []),
        api.getSchedulerStatus().catch(() => null)
      ]);
      setBrief(latest);
      setHistory(past);
      setSchedulerStatus(sched);
    } catch (err) {
      console.error('Failed to load briefs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleGenerate(sessionType: string = '5AM_PREMARKET') {
    setGenerating(true);
    setSuccessMsg(null);
    try {
      const res = await api.generateBriefNow(sessionType);
      setBrief(res);
      setSuccessMsg(`Generated ${sessionType} Brief (SHA256: ${res.immutable_hash.slice(0, 16)}...)`);
      const past = await api.getBriefHistory().catch(() => []);
      setHistory(past);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>5:00 AM Morning Market Intelligence Brief</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              AMERICA/TORONTO TIME
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Immutable morning premarket analysis delivered every trading day before opening bell with SHA-256 fingerprinting.
          </p>
        </div>

        {/* Date Stamp & Trigger Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleGenerate('5AM_PREMARKET')}
            disabled={generating}
            className="flex items-center space-x-2 text-xs font-mono bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg shadow transition"
          >
            {generating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{generating ? 'Running Analysis...' : 'Trigger 5 AM Cycle'}</span>
          </button>

          <div className="flex items-center space-x-2 text-xs font-mono bg-dark-900 border border-dark-700 px-3 py-1.5 rounded-lg text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Session: {brief?.brief_date || 'Today'}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Scheduler & Timezone Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center space-x-3">
          <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Timezone Engine</div>
            <div className="text-white font-bold">{schedulerStatus?.timezone || 'America/Toronto'}</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center space-x-3">
          <Sunrise className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Primary Schedule</div>
            <div className="text-white font-bold">5:00 AM Mon-Fri (Premarket)</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center space-x-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Pre-Open Refresh</div>
            <div className="text-white font-bold">9:15 AM Mon-Fri (Pre-Open)</div>
          </div>
        </div>
      </div>

      {/* Premarket Liquidity Caveat Banner */}
      <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 flex items-start space-x-3 text-xs text-gray-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Premarket Data Caveat (5:00 AM ET):</strong> At 5:00 AM Toronto time, equity trading books reflect early premarket indicative quotes and thin liquidity. Opening gaps are non-final. Previous session closes must be distinguished from early orders. Signals are re-evaluated ahead of the 9:30 AM regular session open.
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-gray-500 font-mono">
          Retrieving 5 AM intelligence brief...
        </div>
      ) : !brief ? (
        <div className="p-12 text-center text-sm text-gray-500 glass-panel rounded-xl">
          No market brief generated for this date. Click &quot;Trigger 5 AM Cycle&quot; to compute today&apos;s report.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Macro Summary & Sentiment */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center justify-between pb-3 border-b border-dark-750 mb-4">
              <div className="flex items-center space-x-2">
                <Sunrise className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Daily Premarket Thesis</h2>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span title={brief.immutable_hash}>
                  SHA256: {brief.immutable_hash.slice(0, 18)}...
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed mb-6 font-sans">
              {brief.macro_summary}
            </p>

            {/* Index Futures Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              {Object.entries(brief.index_futures).map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-dark-850 border border-dark-750">
                  <span className="text-[10px] text-gray-400 uppercase block truncate">{v.name}</span>
                  <div className="text-base font-bold text-white mt-0.5">{v.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <span className={`text-xs font-bold ${v.change_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {v.change_pct >= 0 ? '+' : ''}{v.change_pct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Opportunity Report */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>5:00 AM Top 10 Ranked Opportunities</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-dark-850 text-gray-400 uppercase border-b border-dark-750">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Ticker</th>
                    <th className="p-3">Exchange</th>
                    <th className="p-3">Signal</th>
                    <th className="p-3 text-right">Quality Score</th>
                    <th className="p-3">Grounded Catalyst</th>
                    <th className="p-3 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-750">
                  {brief.top_10_opportunities.map((item) => (
                    <tr key={item.ticker} className="hover:bg-dark-800/50">
                      <td className="p-3 font-bold text-gray-300">#{item.rank}</td>
                      <td className="p-3 font-bold text-white text-sm">{item.ticker}</td>
                      <td className="p-3 text-gray-400">{item.exchange}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.signal === 'BUY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {item.signal}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-cyan-400">{item.score.toFixed(1)}/100</td>
                      <td className="p-3 font-sans text-gray-300 max-w-sm">{item.catalyst}</td>
                      <td className="p-3 text-center">
                        <Link
                          href={`/smart-money?ticker=${item.ticker}`}
                          className="text-cyan-400 hover:text-cyan-300 font-sans"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sector Rotation & Premarket Movers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector Rotation */}
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-3">Institutional Sector Rotation</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-mono text-emerald-400 uppercase text-[10px] block mb-1">Leading / Inflow:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {brief.sector_rotation.Leading?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-cyan-400 uppercase text-[10px] block mb-1">Improving / Accumulating:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {brief.sector_rotation.Improving?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-red-400 uppercase text-[10px] block mb-1">Lagging / Outflow:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {brief.sector_rotation.Lagging?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Catalysts & Notable Risks */}
            <div className="glass-panel p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-3">Macro Announcements & Notable Risks</h3>
              <div className="space-y-2 text-xs text-gray-300">
                {brief.catalysts_and_risks.map((risk, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-cyan-400">•</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
