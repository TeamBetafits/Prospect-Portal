'use client';

import React from 'react';
import { BenefitPlan } from '@/types';

interface PlanRate {
    tier: string;
    premium: number;
    employerCost: number;
    employeeCost: number;
}

interface Props {
    plan: BenefitPlan | null;
    rates: PlanRate[];
    isOpen: boolean;
    onClose: () => void;
}

export default function PlanRatesModal({ plan, rates, isOpen, onClose }: Props) {
    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-md p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-[24px] font-bold text-neutral-900">Plan Rates - {plan.name}</h2>
                        <p className="text-[14px] text-neutral-500 mt-1">{plan.carrier}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {rates.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[14px] text-neutral-500">Rate information not available for this plan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                        Coverage Tier
                                    </th>
                                    <th className="text-right py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                        Premium
                                    </th>
                                    <th className="text-right py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                        Employer Cost
                                    </th>
                                    <th className="text-right py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                        Employee Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map((rate, index) => (
                                    <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                        <td className="py-4 px-4 text-[15px] font-semibold text-neutral-900">
                                            {rate.tier}
                                        </td>
                                        <td className="py-4 px-4 text-right text-[15px] font-semibold text-neutral-900">
                                            ${rate.premium.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4 text-right text-[15px] font-semibold text-neutral-900">
                                            ${rate.employerCost.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4 text-right text-[15px] font-semibold text-neutral-900">
                                            ${rate.employeeCost.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
