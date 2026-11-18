'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'cyan' | 'indigo' | 'red';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  badge,
  badgeColor = 'cyan'
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  const badgeColorMap = {
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-800',
    cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
    indigo: 'bg-indigo-950/80 text-indigo-400 border-indigo-800',
    red: 'bg-red-950/80 text-red-400 border-red-800',
  };

  return (
    <div className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:border-dark-600 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        {badge && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColorMap[badgeColor]}`}>
            {badge}
          </span>
        )}
        {Icon && !badge && <Icon className="w-4 h-4 text-gray-400" />}
      </div>

      <div>
        <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
          {value}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {change !== undefined && (
            <span
              className={`font-semibold font-mono ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          )}
          {changeLabel && <span className="text-gray-400">{changeLabel}</span>}
          {subtitle && !changeLabel && <span className="text-gray-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
