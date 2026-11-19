'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { StockNewsArticle, DailyActionPlaybook } from '../../lib/types';
import StockDetailModal from '../../components/StockDetailModal';

export default function StockNewsPage() {
  const [articles, setArticles] = useState<StockNewsArticle[]>([]);
  const [playbook, setPlaybook] = useState<DailyActionPlaybook | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(null);

  // Toronto Clock
  const [torontoClock, setTorontoClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Toronto',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        }).format(new Date());
        setTorontoClock(timeStr);
      } catch (e) {
        setTorontoClock(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [newsData, playbookData] = await Promise.all([
        api.getRecentStockNews({
          category: selectedCategory === 'ACTIONABLE' ? undefined : selectedCategory,
          action: selectedCategory === 'ACTIONABLE' ? 'BUY_ACCUMULATE' : undefined,
          sentiment: selectedSentiment,
          ticker: searchQuery || undefined
        }),
        api.getDailyActionPlaybook()
      ]);
      setArticles(newsData);
      setPlaybook(playbookData);
    } catch (err) {
      console.error('Failed to load stock news:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, selectedSentiment, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle client-side search filtering if API is in fallback mode
  const displayedArticles = articles.filter((art) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      art.ticker.toLowerCase().includes(q) ||
      art.company_name.toLowerCase().includes(q) ||
      art.headline.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q)
    );
  });

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return {
          label: 'Bullish Impact',
          style: 'bg-emerald-950 text-emerald-400 border-emerald-800',
          icon: TrendingUp
        };
      case 'BEARISH':
        return {
          label: 'Bearish Risk',
          style: 'bg-red-950 text-red-400 border-red-800',
          icon: TrendingDown
        };
      default:
        return {
          label: 'Neutral / Caution',
          style: 'bg-amber-950 text-amber-300 border-amber-800',
          icon: AlertTriangle
        };
    }
  };

  const getVolStyle = (vol: number) => {
    if (vol <= 3) return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    if (vol <= 6) return 'bg-amber-950 text-amber-300 border-amber-800';
    if (vol <= 8) return 'bg-orange-950 text-orange-400 border-orange-800';
    return 'bg-rose-950 text-rose-400 border-rose-800';
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'BUY_ACCUMULATE':
      case 'STRONG_BUY':
        return {
          label: 'BUY / ACCUMULATE',
          style: 'bg-emerald-500 text-white font-bold'
        };
      case 'HOLD_WATCH':
        return {
          label: 'HOLD / WATCH',
          style: 'bg-amber-500 text-dark-950 font-bold'
        };
      case 'AVOID_TRIM':
        return {
          label: 'AVOID / TRIM',
          style: 'bg-rose-500 text-white font-bold'
        };
      default:
        return {
          label: action,
          style: 'bg-cyan-600 text-white'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 5:00 AM Toronto Publication Protocol Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 border border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
            <Newspaper className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Recent Stock News & Daily Action Intelligence
              </h1>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>POSTED DAILY AT 5:00 AM TORONTO TIME</span>
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-3xl leading-relaxed">
              Synthesizing recent financial news, earnings releases, institutional order flow, and SEC filings across
              US (NYSE, NASDAQ) and Canadian (TSX) equities into decisive, daily tactical action plans.
            </p>
          </div>
        </div>

        {/* Toronto Market Clock & Refresh */}
        <div className="flex items-center space-x-3 self-start md:self-center flex-shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-750 text-xs font-mono text-gray-300 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Toronto Time (ET)</span>
              <strong className="text-white text-xs">{torontoClock || '5:00:00 AM EDT'}</strong>
            </div>
          </div>

          <button
            onClick={loadData}
            title="Refresh news feed"
            className="p-2.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-dark-750 text-gray-300 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TODAY'S MARKET PLAYBOOK & WHAT YOU SHOULD DO TODAY */}
      {playbook && (
        <div className="glass-panel p-5 sm:p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-dark-900 via-dark-850 to-cyan-950/20 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-750">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Today&apos;s Market Playbook &amp; What You Should Do Today
                </h2>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Published 5:00 AM America/Toronto Cycle • Active for Regular Trading Session (9:30 AM – 4:00 PM ET)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-semibold">
                Market Bias: {playbook.market_bias.split('/')[0]}
              </span>
            </div>
          </div>

          {/* Executive Tactical Directive Banner */}
          <div className="p-4 rounded-xl bg-dark-900/90 border border-dark-750 leading-relaxed space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Executive Tactical Directive</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
              {playbook.executive_action_summary}
            </p>
          </div>

          {/* 3 Column Action Grid: Top Buys, Watch/Hold, Volatility Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Top Buys Today */}
            <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-750 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Top Accumulations Today</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                  ACTION: BUY
                </span>
              </div>

              <div className="space-y-2">
                {playbook.top_buys_today.map((buy) => (
                  <div
                    key={buy.ticker}
                    onClick={() => setSelectedStockTicker(buy.ticker)}
                    className="p-2.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-700/80 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <strong className="text-white group-hover:text-cyan-400 font-mono transition">
                          {buy.ticker}
                        </strong>
                        <span className={`text-[10px] px-1.5 rounded font-mono font-bold border ${getVolStyle(buy.volatility_score)}`}>
                          Vol {buy.volatility_score}/10
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        Target: {buy.target.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1 font-mono">
                      <span>Entry: <strong className="text-gray-200">{buy.entry_zone}</strong></span>
                      <span>Stop: <strong className="text-red-400">{buy.stop.split(' ')[0]}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Stocks to Watch / Key Levels */}
            <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-750 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Key Watch &amp; Levels</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono">
                  ACTION: WATCH
                </span>
              </div>

              <div className="space-y-2">
                {playbook.stocks_to_watch_today.map((watch) => (
                  <div
                    key={watch.ticker}
                    onClick={() => setSelectedStockTicker(watch.ticker)}
                    className="p-2.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-700/80 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <strong className="text-white group-hover:text-cyan-400 font-mono transition">
                          {watch.ticker}
                        </strong>
                        <span className={`text-[10px] px-1.5 rounded font-mono font-bold border ${getVolStyle(watch.volatility_score)}`}>
                          Vol {watch.volatility_score}/10
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                        {watch.company_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-snug line-clamp-2 font-sans">
                      {watch.guidance}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Volatility & Risk Warnings */}
            <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-750 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Risk &amp; Volatility Directives</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-mono">
                  HIGH BETA
                </span>
              </div>

              <div className="space-y-2">
                {playbook.volatility_warnings_today.map((warn) => (
                  <div
                    key={warn.ticker}
                    onClick={() => setSelectedStockTicker(warn.ticker)}
                    className="p-2.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-700/80 cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-2">
                      <strong className="text-white group-hover:text-cyan-400 font-mono transition">
                        {warn.ticker}
                      </strong>
                      <span className="text-[10px] px-1.5 rounded font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        Vol {warn.volatility_score}/10 Extreme
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-snug font-sans">
                      {warn.warning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono">
          {[
            { id: 'ALL', label: 'All News' },
            { id: 'ACTIONABLE', label: '🟢 Actionable Buys' },
            { id: 'AI_TECH', label: 'AI & Big Tech' },
            { id: 'TSX_CANADIAN', label: 'Canadian (TSX)' },
            { id: 'EARNINGS_IPO', label: 'Earnings & IPOs' },
            { id: 'MACRO_FED', label: 'Macro & Fed' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white font-semibold shadow'
                  : 'bg-dark-900 text-gray-400 hover:text-white border border-dark-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sentiment Controls */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          {/* Sentiment Dropdown */}
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="BULLISH">Bullish Only</option>
            <option value="NEUTRAL_CAUTION">Neutral / Caution</option>
            <option value="BEARISH">Bearish Only</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter stock or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-dark-900 border border-dark-700 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>
      </div>

      {/* STOCK NEWS ARTICLES FEED */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-gray-400 font-mono">
          Loading 5:00 AM daily stock news intelligence...
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="glass-panel p-12 text-center text-xs text-gray-400 font-mono">
          No stock news articles found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedArticles.map((art) => {
            const sent = getSentimentBadge(art.sentiment);
            const SentIcon = sent.icon;
            const act = getActionBadge(art.action_recommendation);

            return (
              <div
                key={art.id}
                className="glass-panel rounded-xl p-5 flex flex-col justify-between hover:border-dark-600 transition space-y-4"
              >
                <div>
                  {/* Top Bar: Source, 5 AM Timestamp, Sentiment & Impact */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-dark-750 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-300">{art.source}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-[11px]">{art.published_at}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1 ${sent.style}`}>
                        <SentIcon className="w-3 h-3" />
                        <span>{sent.label}</span>
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-dark-800 text-cyan-300 font-bold border border-dark-700">
                        {art.market_impact_score.toFixed(1)}/10 Impact
                      </span>
                    </div>
                  </div>

                  {/* Stock Symbol Pills with Volatility */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {/* Primary Ticker */}
                    <button
                      onClick={() => setSelectedStockTicker(art.ticker)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-cyan-950 border border-dark-700 hover:border-cyan-500 text-white font-mono text-xs transition"
                      title={`Click to open ${art.ticker} live quote & volatility`}
                    >
                      <strong className="text-cyan-400 text-sm">{art.ticker}</strong>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${getVolStyle(art.volatility_score)}`}>
                        Vol {art.volatility_score}/10
                      </span>
                    </button>

                    {/* Secondary Tickers */}
                    {art.secondary_tickers && art.secondary_tickers.map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedStockTicker(st)}
                        className="px-2 py-0.5 rounded bg-dark-850 hover:bg-dark-800 border border-dark-750 text-gray-300 hover:text-white font-mono text-[11px] transition"
                        title={`Click to open ${st} quote`}
                      >
                        {st}
                      </button>
                    ))}

                    <span className="text-xs text-gray-400 font-sans ml-1">
                      {art.company_name}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-2.5 leading-snug">
                    {art.headline}
                  </h3>

                  {/* Grounded Financial Summary */}
                  <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-sans">
                    {art.summary}
                  </p>

                  {/* TACTICAL ACTION FOR TODAY (WHAT YOU SHOULD DO) */}
                  <div className="mt-4 p-3.5 rounded-xl bg-dark-900 border border-cyan-850/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tactical Action For Today</span>
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${act.style}`}>
                        {act.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed font-sans">
                      {art.what_to_do_today}
                    </p>
                  </div>

                  {/* Key Price Levels Box */}
                  {art.key_levels && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 p-2.5 rounded-lg bg-dark-850/60 border border-dark-750 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-sans">Entry Zone</span>
                        <strong className="text-gray-200 text-xs">{art.key_levels.entry_zone || 'Market'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-sans">Target Scenario</span>
                        <strong className="text-emerald-400 text-xs">{art.key_levels.target_price || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-sans">Stop Loss</span>
                        <strong className="text-red-400 text-xs">{art.key_levels.stop_loss || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-sans">Modeled Slippage</span>
                        <strong className="text-cyan-300 text-xs">~{art.key_levels.modeled_spread_bps || 6} bps</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Catalyst Type & Cryptographic Hash */}
                <div className="pt-3 border-t border-dark-750 flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 gap-2">
                  <span className="truncate max-w-xs text-gray-400 font-sans">
                    Catalyst: <strong className="text-gray-300">{art.catalyst_type}</strong>
                  </span>

                  <button
                    onClick={() => setSelectedStockTicker(art.ticker)}
                    className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-sans font-semibold text-xs ml-auto"
                  >
                    <span>Analyze {art.ticker}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Stock Deep-Dive Modal */}
      {selectedStockTicker && (
        <StockDetailModal
          ticker={selectedStockTicker}
          onClose={() => setSelectedStockTicker(null)}
        />
      )}
    </div>
  );
}
