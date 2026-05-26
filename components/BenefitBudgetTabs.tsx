"use client";

import React, { useState } from 'react';
import BudgetBreakdownTable from '@/components/BudgetBreakdownTable';
import BudgetSummaryKPIs from '@/components/BudgetSummaryKPIs';
import DemographicInsights from '@/components/DemographicInsights';
import FinancialBenchmarks from '@/components/FinancialBenchmarks';
import BudgetDistribution from '@/components/BudgetDistribution';
import { BudgetBreakdown, DemographicInsights as DemographicInsightsType, FinancialKPIs } from '@/types';

interface BenefitBudgetTabsProps {
  breakdown: BudgetBreakdown[];
  kpis: FinancialKPIs;
  demographics: DemographicInsightsType;
}

export default function BenefitBudgetTabs({ breakdown, kpis, demographics }: BenefitBudgetTabsProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'summary'>('budget');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-neutral-200" role="tablist">
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'budget'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
          role="tab"
          aria-selected={activeTab === 'budget'}
        >
          Budget Details
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-primary-500 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
          role="tab"
          aria-selected={activeTab === 'summary'}
        >
          Summary & Metrics
        </button>
      </div>

      {activeTab === 'budget' && (
        <div className="space-y-8 pt-2 animate-in fade-in duration-300">
          <BudgetBreakdownTable breakdown={breakdown} />
          <BudgetDistribution breakdown={breakdown} />
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-8 pt-2 animate-in fade-in duration-300">
          <BudgetSummaryKPIs kpis={kpis} />
          <DemographicInsights demographics={demographics} />
          <FinancialBenchmarks kpis={kpis} />
        </div>
      )}
    </div>
  );
}
