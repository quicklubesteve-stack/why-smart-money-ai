'use client';

import React from 'react';
import { Stock } from '../lib/types';
import Link from 'next/link';

interface MarketHeatmapProps {
  stocks: Stock[];
}

export default function MarketHeatmap({ stocks }: MarketHeatmapProps) {
  if (!stocks || stocks.length === 0) {
    return null;
  }

  // Sort by market cap or RVOL
  const sorted = [...stocks].sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));

  const getColor = (pct: number) => {
    if (pct >= 3.0) return 'bg-emerald-600/90 text-white';
    if (pct >= 1.5) return 'bg-emerald-700/80 text-emerald-100';
    if (pct > 0.0) return 'bg-emerald-900/60 text-emerald-200';
    if (pct === 0.0) return 'bg-dark-800 text-gray-300';
    if (pct > -1.5) return 'bg-red-950/70 text-red-200';
    if (pct > -3.0) return 'bg-red-800/80 text-red-100';
    return 'bg-red-600/90 text-white';
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {sorted.map((stock) => {
          const isUp = stock.change_pct >= 0;
          return (
            <Link
              key={stock.ticker}
              href={`/smart-money?ticker=${stock.ticker}`}
              className={`p-3 rounded-lg border border-dark-700/60 transition hover:scale-[1.02] flex flex-col justify-between ${getColor(stock.change_pct)}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-sm tracking-tight">{stock.ticker}</span>
                <span className="text-[10px] uppercase font-mono px-1 rounded bg-black/30">
                  {stock.exchange}
                </span>
              </div>

              <div className="my-2">
                <div className="text-xs truncate opacity-85 font-sans">{stock.name}</div>
                <div className="text-base font-bold font-mono mt-0.5">
                  ${stock.current_price?.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-semibold pt-1 border-t border-black/20">
                <span>{isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/40 text-amber-200">
                  Vol {stock.volatility_score ?? 5}/10
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
