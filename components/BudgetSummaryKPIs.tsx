import React from 'react';
import { FinancialKPIs } from '@/types';

interface Props {
    kpis: FinancialKPIs;
}

export default function BudgetSummaryKPIs({ kpis }: Props) {
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
                <span className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Total Monthly Cost
                </span>
                <span className="text-[32px] font-bold text-neutral-900">
                    {formatCurrency(kpis.totalMonthlyCost)}
                </span>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
                <span className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Employer Contribution
                </span>
                <span className="text-[32px] font-bold text-primary-600">
                    {formatCurrency(kpis.totalEmployerContribution)}
                </span>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
                <span className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Employee Contribution
                </span>
                <span className="text-[32px] font-bold text-blue-600">
                    {formatCurrency(kpis.totalEmployeeContribution)}
                </span>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
                <span className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    ER Cost per Eligible
                </span>
                <span className="text-[32px] font-bold text-neutral-900">
                    {formatCurrency(kpis.erCostPerEligible)}
                </span>
            </div>
        </div>
    );
}
