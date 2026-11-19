'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Zap,
  TrendingUp,
  BrainCircuit,
  Sunrise,
  Briefcase,
  LineChart,
  Settings,
  ShieldCheck,
  Dna,
  CreditCard,
  Newspaper
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/scanner', label: 'Stock Scanner', icon: Search },
  { href: '/signals', label: 'Trading Signals', icon: Zap },
  { href: '/smart-money', label: 'Smart Money Flows', icon: TrendingUp },
  { href: '/simulation', label: '2,000 MC Simulator', icon: Dna },
  { href: '/predictions', label: 'AI Forecasts', icon: BrainCircuit },
  { href: '/brief', label: '5 AM Market Brief', icon: Sunrise },
  { href: '/news', label: 'Recent Stock News', icon: Newspaper },
  { href: '/paper-trading', label: 'Paper Simulator', icon: Briefcase },
  { href: '/performance', label: 'Model Accuracy', icon: LineChart },
  { href: '/pricing', label: 'Plans & Tiers', icon: CreditCard },
  { href: '/settings', label: 'System & Providers', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-dark-700 bg-dark-900/90 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Intelligence Modules
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-dark-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-dark-700">
        <div className="p-3 rounded-lg bg-dark-850 border border-dark-750">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Risk Guardrails</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
            Live orders disabled. Simulation with realistic slippage & spread active.
          </p>
        </div>
      </div>
    </aside>
  );
}
