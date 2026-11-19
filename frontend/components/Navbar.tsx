'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Activity,
  Sparkles,
  RefreshCw,
  Radio,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import OnboardingModal from './OnboardingModal';
import SearchBar from './SearchBar';
import StockDetailModal from './StockDetailModal';
import Link from 'next/link';
import { api } from '../lib/api';

interface NavbarProps {
  isDemoMode?: boolean;
}

export default function Navbar({ isDemoMode = true }: NavbarProps) {
  const [torontoTime, setTorontoTime] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTier, setActiveTier] = useState<string>('PRO');
  const [selectedStockTicker, setSelectedStockTicker] = useState<string | null>(null);
  const [liveQuotes, setLiveQuotes] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  const fetchLiveQuotes = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const quotes = await api.getLiveQuotes();
      if (quotes && quotes.length > 0) {
        setLiveQuotes(quotes);
        const now = new Date();
        setLastUpdated(
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
        );
      }
    } catch (e) {
      // fallback
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(now);
      setTorontoTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchTier() {
      try {
        const tierData = await api.getCurrentTier();
        if (tierData?.current_tier) {
          setActiveTier(tierData.current_tier);
        }
      } catch (e) {
        // fallback
      }
    }
    fetchTier();
    fetchLiveQuotes();

    // Auto-poll live market quotes every 10 seconds
    const quoteInterval = setInterval(fetchLiveQuotes, 10000);
    return () => clearInterval(quoteInterval);
  }, [fetchLiveQuotes]);

  return (
    <>
      <header className="h-16 border-b border-dark-700 bg-dark-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 gap-4">
        {/* Left: Brand & Market Clock */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              SM
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">WHY SMART MONEY</span>
              <span className="hidden sm:inline-block text-xs ml-2 px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-800">
                AI v1.0
              </span>
            </div>
          </Link>

          {/* Real-time Toronto/ET Market Clock */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-md bg-dark-850 border border-dark-700 text-xs text-gray-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>ET: {torontoTime || 'Loading Toronto Time...'}</span>
          </div>
        </div>

        {/* Center: Global Company Name & Stock Symbol Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <SearchBar
            onSelectStock={(ticker) => setSelectedStockTicker(ticker)}
            placeholder="Search company (e.g. Anthropic, Apple, Nvidia) or symbol..."
          />
        </div>

        {/* Right: Actions, Live Feed Indicator, Tier, & Status Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Live Market Feed Pulse */}
          <button
            onClick={fetchLiveQuotes}
            title={`Live market feed active (last updated: ${lastUpdated}). Click to refresh now.`}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/80 text-emerald-300 text-xs font-mono transition hover:bg-emerald-900/70"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden lg:inline text-[11px] font-semibold">LIVE FEED</span>
            <RefreshCw className={`w-3 h-3 text-emerald-400 ml-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Active Tier Pill */}
          <Link
            href="/pricing"
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
              activeTier === 'FREE'
                ? 'bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
                : 'bg-cyan-950/70 border-cyan-700 text-cyan-300 hover:bg-cyan-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{activeTier} PLAN</span>
            <span className="sm:hidden">{activeTier}</span>
          </Link>

          {/* Quick Onboarding Button */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs text-gray-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Guide</span>
          </button>
        </div>
      </header>

      {/* Live Market Ticker Tape Strip */}
      <div className="bg-dark-950/90 border-b border-dark-800 py-1 px-4 overflow-x-auto flex items-center space-x-4 text-xs font-mono text-gray-300 no-scrollbar">
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1 flex-shrink-0">
          <Activity className="w-3 h-3" />
          <span>MARKET TICKER:</span>
        </span>

        <div className="flex items-center space-x-4 flex-shrink-0">
          {(liveQuotes.length > 0 ? liveQuotes : [
            { ticker: 'ANT', current_price: 96.40, change_pct: 3.65, name: 'Anthropic' },
            { ticker: 'NVDA', current_price: 152.06, change_pct: 2.85, name: 'NVIDIA' },
            { ticker: 'PLTR', current_price: 154.99, change_pct: 4.10, name: 'Palantir' },
            { ticker: 'SHOP.TO', current_price: 212.57, change_pct: 3.25, name: 'Shopify' },
            { ticker: 'TSLA', current_price: 381.35, change_pct: 3.60, name: 'Tesla' },
            { ticker: 'MSFT', current_price: 502.63, change_pct: 1.12, name: 'Microsoft' },
            { ticker: 'AAPL', current_price: 349.49, change_pct: 0.65, name: 'Apple' }
          ]).map((q) => {
            const isUp = (q.change_pct ?? 0) >= 0;
            return (
              <button
                key={q.ticker}
                onClick={() => setSelectedStockTicker(q.ticker)}
                className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-dark-900 hover:bg-dark-800 border border-dark-750 transition flex-shrink-0 text-[11px]"
                title={`Click to view ${q.ticker} (${q.name || q.ticker}) detailed quote & forecast`}
              >
                <span className={`font-bold ${q.ticker === 'ANT' ? 'text-cyan-300 underline font-extrabold' : 'text-white'}`}>
                  {q.ticker}
                </span>
                <span className="text-gray-300">${q.current_price?.toFixed(2)}</span>
                <span className={`flex items-center text-[10px] ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}{q.change_pct?.toFixed(2)}%
                </span>
                {q.ticker === 'ANT' && (
                  <span className="text-[9px] px-1 rounded bg-indigo-950 text-indigo-300 font-sans border border-indigo-800">
                    IPO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Stock Deep-Dive Modal */}
      {selectedStockTicker && (
        <StockDetailModal
          ticker={selectedStockTicker}
          onClose={() => setSelectedStockTicker(null)}
        />
      )}

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </>
  );
}
