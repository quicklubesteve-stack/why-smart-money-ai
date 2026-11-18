'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, TrendingUp, Sunrise, BrainCircuit } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Welcome to Why Smart Money AI',
    icon: BrainCircuit,
    description: 'An institutional-grade stock intelligence platform built to monitor NYSE, NASDAQ, and TSX equities with walk-forward machine learning and institutional proxy analysis.',
    highlights: [
      'Analyzes US and Canadian securities every trading morning',
      'Walk-forward model training preventing data leakage or lookahead bias',
      'Aspirational 95% win rate is treated as a scientific research target, never a marketing claim'
    ]
  },
  {
    title: 'Smart Money Institutional Proxies',
    icon: TrendingUp,
    description: 'Track volume-price divergence, relative volume (RVOL), VWAP behavior, and off-exchange trading activity.',
    highlights: [
      'SEC 13F filings are delayed by up to 45 days and represent historical snapshots, not real-time holdings',
      'Dark pool and off-exchange activity are proxy estimates from trade condition flags',
      'Zero fabricated or invented order-flow metrics'
    ]
  },
  {
    title: '5:00 AM America/Toronto Morning Brief',
    icon: Sunrise,
    description: 'Every trading morning at 5:00 AM ET, an automated report is generated and stamped with an immutable SHA-256 hash.',
    highlights: [
      'Clearly distinguishes previous-session closes from thin early premarket liquidity',
      'Premarket price gaps are non-final pending 9:30 AM regular session volume',
      'Independent holiday calendars for US (NYSE/NASDAQ) and Canadian (TSX) markets'
    ]
  },
  {
    title: 'Paper Trading & Execution Guardrails',
    icon: ShieldCheck,
    description: 'Practice simulated execution with realistic fees, bid-ask spreads, and order slippage.',
    highlights: [
      'Live execution is disabled by default for absolute capital safety',
      'Orders require explicit user confirmation with single-position allocation limits',
      'Fail-closed policy protects your capital from stale or corrupted market data'
    ]
  }
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const Icon = step.icon;

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-dark-750 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <span>STEP {currentStep + 1} OF {STEPS.length}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-dark-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-cyan-400" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">{step.description}</p>

          <div className="space-y-3 bg-dark-850 p-4 rounded-lg border border-dark-750">
            {step.highlights.map((h, i) => (
              <div key={i} className="flex items-start space-x-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-dark-750 bg-dark-950/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-200 px-3 py-1.5"
          >
            Skip Tour
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 rounded-lg bg-dark-800 text-xs font-medium text-gray-300 hover:bg-dark-700 transition"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg transition"
            >
              <span>{currentStep === STEPS.length - 1 ? 'Start Exploring' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
