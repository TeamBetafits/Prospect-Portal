'use client';

import React from 'react';
import { BenefitPlan } from '@/types';

interface Props {
    plan: BenefitPlan | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PlanDetailModal({ plan, isOpen, onClose }: Props) {
    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-md p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-[24px] font-bold text-neutral-900">{plan.name}</h2>
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

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                            Plan Type
                        </span>
                        <p className="text-[16px] font-medium text-neutral-900">{plan.type}</p>
                    </div>
                    <div>
                        <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                            Deductible (Single)
                        </span>
                        <p className="text-[16px] font-medium text-neutral-900">{plan.deductible}</p>
                    </div>
                    <div>
                        <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                            OOPM (Single)
                        </span>
                        <p className="text-[16px] font-medium text-neutral-900">{plan.oopm}</p>
                    </div>
                    {plan.copay && (
                        <div>
                            <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                                Copay
                            </span>
                            <p className="text-[16px] font-medium text-neutral-900">{plan.copay}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                    <p className="text-[13px] text-neutral-500">
                        Additional plan details and coverage information are available upon request.
                    </p>
                </div>
            </div>
        </div>
    );
}
