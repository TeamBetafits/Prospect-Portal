import React from 'react';
import { unstable_noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import BenefitBudgetTabs from '@/components/BenefitBudgetTabs';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { getBenefitsAnalysisData, checkPublishedBudgetExists } from '@/lib/supabase/portal';
import { BudgetBreakdown, DemographicInsights as DemographicInsightsType, FinancialKPIs } from '@/types';

export const dynamic = 'force-dynamic';

const emptyDemographics: DemographicInsightsType = {
  eligibleEmployees: 0,
  averageSalary: 0,
  averageAge: 0,
  malePercentage: 0,
  femalePercentage: 0,
};

const emptyKpis: FinancialKPIs = {
  totalMonthlyCost: 0,
  totalEmployerContribution: 0,
  totalEmployeeContribution: 0,
  erCostPerEligible: 0,
};

export default async function BenefitBudgetPage() {
  unstable_noStore();
  const companyId = await getCompanyId();

  if (!companyId) {
    redirect('/');
  }

  // Enforce server-side route security: redirect to homepage if no published budget exists
  const hasPublished = await checkPublishedBudgetExists(companyId);
  if (!hasPublished) {
    redirect('/');
  }

  let demographics = emptyDemographics;
  let kpis = emptyKpis;
  let breakdown: BudgetBreakdown[] = [];

  try {
    const data = await getBenefitsAnalysisData(companyId);
    demographics = data.demographics || emptyDemographics;
    kpis = data.kpis || emptyKpis;
    breakdown = data.breakdown;
  } catch (error) {
    console.error('[BenefitBudgetPage] Error fetching Supabase data:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader
        title="Benefit Budget"
        subtitle="Provide financial overview and cost breakdown of benefits."
      />

      <BenefitBudgetTabs
        breakdown={breakdown}
        kpis={kpis}
        demographics={demographics}
      />
    </div>
  );
}
