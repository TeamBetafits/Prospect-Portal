import React from 'react';
import { BudgetBreakdown } from '@/types';

interface Props {
    breakdown: BudgetBreakdown[];
}

export default function BudgetDistribution({ breakdown }: Props) {

    const total = breakdown.reduce((sum, b) => sum + b.monthlyTotal, 0);
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    
    const getBenefitColor = (benefit: string) => {
        if (benefit === 'Medical') return 'bg-primary-500';
        if (benefit === 'Dental') return 'bg-blue-500';
        return 'bg-amber-500';
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Budget Distribution</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Breakdown of total benefits spend by category.</p>
            </div>
            {/* Bar Chart Visualization */}
            <div className="flex h-12 w-full rounded-full overflow-hidden mb-8 bg-neutral-100">
                {breakdown.length > 0 ? breakdown.map((item, idx) => {
                    const percentage = total > 0 ? (item.monthlyTotal / total) * 100 : 0;
                    return (
                        <div
                            key={idx}
                            className={`${getBenefitColor(item.benefit)} h-full flex items-center justify-center text-white font-bold text-[13px] hover:opacity-90 transition-opacity cursor-pointer min-w-[2px]`}
                            style={{ width: `${percentage}%` }}
                            title={`${item.benefit}: ${formatCurrency(item.monthlyTotal)}`}
                        >
                            {percentage > 5 && `${percentage.toFixed(1)}%`}
                        </div>
                    );
                }) : (
                    <div className="w-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-md flex items-center justify-center">
                            <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend / Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {breakdown.length > 0 ? breakdown.map((item, idx) => {
                    const percentage = total > 0 ? (item.monthlyTotal / total) * 100 : 0;
                    return (
                        <div
                            key={idx}
                            className="flex items-start gap-3 p-4 rounded-md hover:bg-neutral-50 transition-colors border border-neutral-100"
                        >
                            <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${getBenefitColor(item.benefit)}`} />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-neutral-900 text-[14px] truncate">{item.benefit}</h4>
                                <p className="text-[13px] text-neutral-500 font-medium">
                                    {formatCurrency(item.monthlyTotal)}
                                </p>
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                    {percentage.toFixed(1)}% of total
                                </p>
                            </div>
                        </div>
                    );
                }) : null}
            </div>
        </div>
    );
}
