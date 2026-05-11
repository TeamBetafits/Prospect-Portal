'use client';

import React, { useState } from 'react';
import { BenefitPlan } from '@/types';
import PlanDetailModal from './PlanDetailModal';
import PlanRatesModal from './PlanRatesModal';

interface Props {
    plans: BenefitPlan[];
}

export default function DentalPlansList({ plans }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<BenefitPlan | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [ratesModalOpen, setRatesModalOpen] = useState(false);

    const mockRates = [
        { tier: 'EE', premium: 50, employerCost: 40, employeeCost: 10 },
        { tier: 'ES', premium: 100, employerCost: 80, employeeCost: 20 },
        { tier: 'EC', premium: 150, employerCost: 120, employeeCost: 30 },
        { tier: 'EF', premium: 200, employerCost: 160, employeeCost: 40 },
    ];

    const handleViewDetails = (plan: BenefitPlan) => {
        setSelectedPlan(plan);
        setDetailModalOpen(true);
    };

    const handleViewRates = (plan: BenefitPlan) => {
        setSelectedPlan(plan);
        setRatesModalOpen(true);
    };

    if (plans.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[14px] text-neutral-500">No dental plans available.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-neutral-50 border border-neutral-200 rounded-md p-6 hover:shadow-card transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-md flex items-center justify-center font-bold text-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    D
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-bold text-neutral-900">{plan.name}</h3>
                                    <p className="text-[13px] text-neutral-500 font-medium">
                                        {plan.carrier}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-wrap gap-6 md:gap-12">
                                    <div>
                                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                                            Deductible
                                        </span>
                                        <span className="text-[15px] font-semibold text-neutral-900">
                                            {plan.deductible}
                                        </span>
                                    </div>
                                    {plan.copay && (
                                        <div>
                                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                                                Copay
                                            </span>
                                            <span className="text-[15px] font-semibold text-neutral-900">
                                                {plan.copay}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewDetails(plan)}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-md text-[13px] font-bold hover:bg-primary-700 transition-colors"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleViewRates(plan)}
                                        className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md text-[13px] font-bold hover:bg-neutral-50 transition-colors"
                                    >
                                        View Rates
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <PlanDetailModal
                plan={selectedPlan}
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
            />
            <PlanRatesModal
                plan={selectedPlan}
                rates={mockRates}
                isOpen={ratesModalOpen}
                onClose={() => setRatesModalOpen(false)}
            />
        </>
    );
}
