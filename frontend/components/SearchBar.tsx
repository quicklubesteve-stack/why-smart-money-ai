'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Activity, ArrowRight, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { Stock } from '../lib/types';

interface SearchBarProps {
  onSelectStock: (ticker: string) => void;
  className?: string;
  placeholder?: string;
}

export default function SearchBar({
  onSelectStock,
  className = '',
  placeholder = 'Search by company name (e.g. Apple, NVIDIA, Shopify) or symbol...'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await api.searchStocks(query.trim());
        setResults(matches || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (e) {
        console.error('Failed to search stocks:', e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (ticker: string) => {
    onSelectStock(ticker);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].ticker);
      } else if (results.length > 0) {
        handleSelect(results[0].ticker);
      }
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-dark-850/90 hover:bg-dark-800 focus:bg-dark-900 border border-dark-700 focus:border-cyan-500 text-white placeholder-gray-400 focus:outline-none transition shadow-inner font-sans"
        />

        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-2.5 p-1 rounded-md text-gray-400 hover:text-white hover:bg-dark-750 transition"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 flex flex-col animate-fadeIn">
          {/* Header hint */}
          <div className="px-3 py-2 bg-dark-850/90 border-b border-dark-750 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>
              {results.length > 0 ? `${results.length} matching securities found` : 'Searching universe...'}
            </span>
            <span className="text-[10px] text-gray-500">Click stock symbol to open quote & forecast</span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-dark-800">
            {loading && results.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 font-mono">
                Searching company names & symbols...
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 font-mono">
                No company or ticker matching &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map((stock, idx) => {
                const isSelected = selectedIndex === idx;
                const isUp = (stock.change_pct ?? 0) >= 0;
                const volPct = (stock.volatility_30d * 100).toFixed(0);

                return (
                  <button
                    key={stock.ticker}
                    onClick={() => handleSelect(stock.ticker)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3 flex items-center justify-between transition ${
                      isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-dark-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Stock Symbol Badge */}
                      <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-cyan-300 font-mono font-bold text-xs hover:border-cyan-500 transition">
                        {stock.ticker}
                      </div>

                      {/* Full Company Name & Details */}
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-xs truncate flex items-center space-x-1.5">
                          <span>{stock.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-dark-800 text-gray-300">
                            {stock.exchange}
                          </span>
                          <span>{stock.currency}</span>
                          {stock.sector && <span>• {stock.sector}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Price & Volatility */}
                    <div className="flex items-center space-x-3 flex-shrink-0 text-right font-mono">
                      <div>
                        <div className="font-bold text-white text-xs">
                          ${stock.current_price?.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-semibold flex items-center justify-end space-x-0.5 ${
                            isUp ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          <span>
                            {isUp ? '+' : ''}
                            {stock.change_pct.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Volatility Badge */}
                      <div className="hidden sm:flex flex-col items-end text-[10px] text-gray-400">
                        <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-dark-800 border border-dark-700 text-amber-300">
                          <Activity className="w-2.5 h-2.5" />
                          <span>Vol {volPct}%</span>
                        </span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-gray-500 hover:text-cyan-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
