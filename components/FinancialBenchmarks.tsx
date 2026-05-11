import React from 'react';
import { FinancialKPIs } from '@/types';

interface Props {
    kpis: FinancialKPIs;
}

export default function FinancialBenchmarks({ kpis }: Props) {
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="bg-primary-900 rounded-md p-6 shadow-card text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="mb-6">
                    <h2 className="text-[20px] font-bold mb-1">Financial Benchmarks</h2>
                    <p className="text-primary-400 text-[13px]">Cost performance relative to industry standards.</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <span className="text-[13px] font-bold text-primary-400 uppercase tracking-wider block mb-1">
                            Total Monthly Cost
                        </span>
                        <span className="text-[32px] font-bold text-white">
                            {formatCurrency(kpis.totalMonthlyCost)}
                        </span>
                    </div>
                    <div>
                        <span className="text-[13px] font-bold text-primary-400 uppercase tracking-wider block mb-1">
                            Employer Contribution
                        </span>
                        <span className="text-[32px] font-bold text-white">
                            {formatCurrency(kpis.totalEmployerContribution)}
                        </span>
                    </div>
                    <div>
                        <span className="text-[13px] font-bold text-primary-400 uppercase tracking-wider block mb-1">
                            Employee Contribution
                        </span>
                        <span className="text-[32px] font-bold text-white">
                            {formatCurrency(kpis.totalEmployeeContribution)}
                        </span>
                    </div>
                    <div>
                        <span className="text-[13px] font-bold text-primary-400 uppercase tracking-wider block mb-1">
                            ER Cost per Eligible
                        </span>
                        <span className="text-[32px] font-bold text-white">
                            {formatCurrency(kpis.erCostPerEligible)}
                        </span>
                    </div>
                </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full filter blur-xl"></div>
            <div className="absolute bottom-0 left-10 w-32 h-32 bg-primary-500/20 rounded-full filter blur-2xl"></div>
        </div>
    );
}
