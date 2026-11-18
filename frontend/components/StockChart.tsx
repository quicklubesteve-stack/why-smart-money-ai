'use client';

import React, { useState } from 'react';
import { Bar } from '../lib/types';

interface StockChartProps {
  bars: Bar[];
  ticker: string;
  currency: string;
  targetPrice?: number;
  stopLoss?: number;
  entryZoneMin?: number;
  entryZoneMax?: number;
}

export default function StockChart({
  bars,
  ticker,
  currency,
  targetPrice,
  stopLoss,
  entryZoneMin,
  entryZoneMax
}: StockChartProps) {
  const [hoveredBar, setHoveredBar] = useState<Bar | null>(null);

  if (!bars || bars.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-gray-500 font-mono">
        No bar data available for {ticker}
      </div>
    );
  }

  // Calculate scales
  const prices = bars.flatMap(b => [b.open, b.high, b.low, b.close]);
  if (targetPrice) prices.push(targetPrice);
  if (stopLoss) prices.push(stopLoss);

  const minPrice = Math.min(...prices) * 0.98;
  const maxPrice = Math.max(...prices) * 1.02;
  const priceRange = maxPrice - minPrice;

  const maxVolume = Math.max(...bars.map(b => b.volume));

  const width = 800;
  const height = 320;
  const priceHeight = 240;
  const volumeHeight = 60;
  const paddingX = 40;

  const getX = (index: number) => {
    return paddingX + (index / (bars.length - 1)) * (width - paddingX * 2);
  };

  const getY = (price: number) => {
    return priceHeight - ((price - minPrice) / priceRange) * priceHeight;
  };

  const getVolY = (vol: number) => {
    return height - (vol / maxVolume) * volumeHeight;
  };

  const candleWidth = Math.max(2, (width - paddingX * 2) / bars.length * 0.65);

  const latest = hoveredBar || bars[bars.length - 1];

  return (
    <div className="w-full bg-dark-900 border border-dark-750 rounded-xl p-4 flex flex-col">
      {/* Chart Top Bar with Live HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dark-750 mb-3 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white text-base">{ticker}</span>
          <span className="text-gray-400">Date: {latest.date}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">O: <strong className="text-gray-200">${latest.open.toFixed(2)}</strong></span>
          <span className="text-gray-400">H: <strong className="text-gray-200">${latest.high.toFixed(2)}</strong></span>
          <span className="text-gray-400">L: <strong className="text-gray-200">${latest.low.toFixed(2)}</strong></span>
          <span className="text-gray-400">C: <strong className={latest.close >= latest.open ? 'text-emerald-400' : 'text-red-400'}>${latest.close.toFixed(2)}</strong></span>
          <span className="text-gray-400">Vol: <strong className="text-gray-200">{(latest.volume / 1000000).toFixed(2)}M</strong></span>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-h-[280px]"
          onMouseLeave={() => setHoveredBar(null)}
        >
          {/* Price Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct, i) => {
            const p = minPrice + priceRange * pct;
            const y = getY(p);
            return (
              <g key={i}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={width - paddingX + 5} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                  {p.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Volume Separator */}
          <line x1={paddingX} y1={priceHeight} x2={width - paddingX} y2={priceHeight} stroke="#334155" />

          {/* Target Price Overlay */}
          {targetPrice && (
            <g>
              <line
                x1={paddingX}
                y1={getY(targetPrice)}
                x2={width - paddingX}
                y2={getY(targetPrice)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x={paddingX + 6} y={getY(targetPrice) - 4} fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                TARGET: ${targetPrice.toFixed(2)} {currency}
              </text>
            </g>
          )}

          {/* Stop Loss Overlay */}
          {stopLoss && (
            <g>
              <line
                x1={paddingX}
                y1={getY(stopLoss)}
                x2={width - paddingX}
                y2={getY(stopLoss)}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x={paddingX + 6} y={getY(stopLoss) - 4} fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                STOP LOSS: ${stopLoss.toFixed(2)} {currency}
              </text>
            </g>
          )}

          {/* Entry Zone Overlay */}
          {entryZoneMin && entryZoneMax && (
            <rect
              x={paddingX}
              y={getY(entryZoneMax)}
              width={width - paddingX * 2}
              height={Math.max(2, getY(entryZoneMin) - getY(entryZoneMax))}
              fill="#06b6d4"
              opacity="0.12"
            />
          )}

          {/* Candlesticks & Volume Bars */}
          {bars.map((bar, idx) => {
            const x = getX(idx);
            const isBullish = bar.close >= bar.open;
            const color = isBullish ? '#10b981' : '#ef4444';

            const openY = getY(bar.open);
            const closeY = getY(bar.close);
            const highY = getY(bar.high);
            const lowY = getY(bar.low);
            const volY = getVolY(bar.volume);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

            return (
              <g
                key={idx}
                className="cursor-pointer transition opacity-90 hover:opacity-100"
                onMouseEnter={() => setHoveredBar(bar)}
              >
                {/* Wick */}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />

                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx="1"
                />

                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={height - volY}
                  fill={isBullish ? '#065f46' : '#991b1b'}
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* VWAP Polyline */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeOpacity="0.85"
            points={bars
              .map((b, i) => `${getX(i)},${getY(b.vwap || b.close)}`)
              .join(' ')}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-dark-750 text-[11px] text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
            <span>Bullish Candle</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span>
            <span>Bearish Candle</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-amber-500"></span>
            <span>Institutional VWAP</span>
          </div>
        </div>
        <span>Timescale: Daily Regular Session</span>
      </div>
    </div>
  );
}
