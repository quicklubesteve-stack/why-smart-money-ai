'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, AlertTriangle, HelpCircle, ExternalLink, Activity, Sparkles } from 'lucide-react';
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
  }, []);

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
            placeholder="Search company (e.g. Apple, NVIDIA, Shopify) or ticker..."
          />
        </div>

        {/* Right: Actions, Tier, & Status Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
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

          {/* Demo Data Mode Pill */}
          {isDemoMode && (
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800/70 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>DEMO MODE (SYNTHETIC FEED)</span>
            </div>
          )}

          {/* Strict Live Execution Disabled Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>LIVE TRADING: LOCKED</span>
          </div>

          {/* Quick Onboarding Button */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs text-gray-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">System Guide</span>
          </button>
        </div>
      </header>

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
