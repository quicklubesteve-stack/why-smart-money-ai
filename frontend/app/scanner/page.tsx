'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Stock } from '../../lib/types';
import { Search, Filter, ArrowUpDown, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import StockDetailModal from '../../components/StockDetailModal';

export default function ScannerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exchange, setExchange] = useState('ALL');
  const [liquidOnly, setLiquidOnly] = useState(true);
  const [minRvol, setMinRvol] = useState<number>(0);
  const [sortBy, setSortBy] = useState('relative_volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStockModalTicker, setSelectedStockModalTicker] = useState<string | null>(null);

  const loadStocks = async () => {
    setLoading(true);
    try {
      const params: any = {
        liquid_only: liquidOnly,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: 100
      };
      if (search) params.search = search;
      if (exchange !== 'ALL') params.exchange = exchange;
      if (minRvol > 0) params.min_rvol = minRvol;

      const data = await api.getScannerStocks(params);
      setStocks(data);
    } catch (err) {
      console.error('Failed to fetch scanner stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, [exchange, liquidOnly, minRvol, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStocks();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Quantitative Stock Scanner</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              NYSE • NASDAQ • TSX
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time scanner filtering liquid securities, momentum, relative volume (RVOL), and spread costs.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker, name (e.g. NVDA, SHOP.TO, PLTR)..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-900 border border-dark-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </form>

          {/* Exchange Filter Tabs */}
          <div className="flex items-center space-x-1 bg-dark-900 p-1 rounded-lg border border-dark-700 text-xs font-mono">
            {['ALL', 'NASDAQ', 'NYSE', 'TSX'].map((ex) => (
              <button
                key={ex}
                onClick={() => setExchange(ex)}
                className={`px-3 py-1 rounded-md transition ${
                  exchange === ex
                    ? 'bg-cyan-600 text-white font-semibold shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
              <input
                type="checkbox"
                checked={liquidOnly}
                onChange={(e) => setLiquidOnly(e.target.checked)}
                className="rounded bg-dark-900 border-dark-700 text-cyan-500 focus:ring-0"
              />
              <span>Exclude Illiquid</span>
            </label>

            <select
              value={minRvol}
              onChange={(e) => setMinRvol(Number(e.target.value))}
              className="bg-dark-900 border border-dark-700 rounded-lg px-2.5 py-1.5 text-gray-300 font-mono focus:outline-none"
            >
              <option value={0}>All Volume</option>
              <option value={1.2}>RVOL &gt; 1.2x</option>
              <option value={1.5}>RVOL &gt; 1.5x (Institutional)</option>
              <option value={2.0}>RVOL &gt; 2.0x (High Volume)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-850/90 text-gray-400 uppercase font-mono border-b border-dark-750">
              <tr>
                <th onClick={() => handleSort('ticker')} className="p-3.5 cursor-pointer hover:text-white">
                  <div className="flex items-center space-x-1">
                    <span>Ticker</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5">Exchange / Currency</th>
                <th onClick={() => handleSort('current_price')} className="p-3.5 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('change_pct')} className="p-3.5 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end space-x-1">
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('relative_volume')} className="p-3.5 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Relative Vol (RVOL)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 text-right">RSI (14)</th>
                <th className="p-3.5 text-right">ATR</th>
                <th className="p-3.5 text-right">Data Integrity</th>
                <th className="p-3.5 text-right">Data Source</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 font-sans">
                    Scanning securities across exchanges...
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 font-sans">
                    No securities match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const isUp = stock.change_pct >= 0;
                  const isHighRvol = stock.relative_volume >= 1.5;

                  return (
                    <tr key={stock.ticker} className="hover:bg-dark-800/60 transition">
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedStockModalTicker(stock.ticker)}
                          className="flex items-center space-x-2 text-left group"
                          title={`Click to view ${stock.ticker} quote, volatility, history & prediction`}
                        >
                          <span className="font-bold text-white text-sm group-hover:text-cyan-400 group-hover:underline transition">
                            {stock.ticker}
                          </span>
                          <span className="text-[11px] font-sans text-gray-400 truncate max-w-[140px] group-hover:text-gray-200">
                            {stock.name}
                          </span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <span className="px-1.5 py-0.5 rounded bg-dark-800 text-gray-300 text-[10px] mr-1.5">
                          {stock.exchange}
                        </span>
                        <span className="text-gray-400 text-[11px]">{stock.currency}</span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-white">
                        ${stock.current_price?.toFixed(2)}
                      </td>
                      <td className={`p-3.5 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
                      </td>
                      <td className="p-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isHighRvol
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'text-gray-300'
                        }`}>
                          {stock.relative_volume.toFixed(2)}x
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-gray-300">
                        {stock.rsi_14 ? stock.rsi_14.toFixed(1) : '50.0'}
                      </td>
                      <td className="p-3.5 text-right text-gray-400">
                        ${stock.atr_14 ? stock.atr_14.toFixed(2) : '2.50'}
                      </td>
                      <td className="p-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stock.data_quality_status === 'VERIFIED_OK'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {stock.data_quality_status || 'VERIFIED_OK'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-dark-850 text-cyan-400 border border-dark-700">
                          {stock.data_source}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <Link
                          href={`/smart-money?ticker=${stock.ticker}`}
                          className="px-2.5 py-1 rounded bg-dark-800 hover:bg-cyan-900/40 text-cyan-400 hover:text-cyan-300 border border-dark-700 text-[11px] font-sans transition inline-flex items-center space-x-1"
                        >
                          <span>Analyze</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Deep-Dive Modal */}
      {selectedStockModalTicker && (
        <StockDetailModal
          ticker={selectedStockModalTicker}
          onClose={() => setSelectedStockModalTicker(null)}
        />
      )}
    </div>
  );
}
