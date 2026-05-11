'use client';

import React from 'react';
import { BudgetBreakdown } from '@/types';

interface Props {
    breakdown: BudgetBreakdown[];
}

export default function BudgetBreakdownTable({ breakdown }: Props) {

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Budget Breakdown</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Detailed breakdown of budget by benefit type.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Benefit
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Carrier
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Monthly Total
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Annual Total
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                ER Cost/Month
                            </th>
                            <th className="text-right py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                EE Cost/Month
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {breakdown.length > 0 ? breakdown.map((item, idx) => {
                            const formatCurrency = (val: number) => 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
                            
                            const getBenefitColor = (benefit: string) => {
                                if (benefit === 'Medical') return 'bg-primary-500';
                                if (benefit === 'Dental') return 'bg-blue-500';
                                return 'bg-amber-500';
                            };
                            
                            return (
                                <tr key={idx} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getBenefitColor(item.benefit)}`} />
                                            <span className="text-[15px] font-semibold text-neutral-900">{item.benefit}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-[15px] font-medium text-neutral-600">
                                        {item.carrier}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-neutral-900">
                                        {formatCurrency(item.monthlyTotal)}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-neutral-900">
                                        {formatCurrency(item.annualTotal)}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-primary-600">
                                        {formatCurrency(item.erCostMonth)}
                                    </td>
                                    <td className="py-4 px-4 text-right text-[15px] font-semibold text-blue-600">
                                        {formatCurrency(item.eeCostMonth)}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="py-12">
                                    <div className="flex items-center justify-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-md flex items-center justify-center">
                                            <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
