import React from 'react';
import { BenefitEligibilityData } from '@/types';

interface Props {
    eligibility: BenefitEligibilityData;
}

export default function BenefitEligibilityCard({ eligibility }: Props) {
    return (
        <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Eligibility Rules</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Configuration for employee benefit eligibility.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Benefit Class
                    </span>
                    <div className="text-[16px] font-bold text-neutral-900 bg-primary-50 inline-block px-4 py-2 rounded-md text-primary-700">
                        {eligibility.className || '-'}
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Waiting Period
                    </span>
                    <div className="text-[16px] font-bold text-neutral-900 bg-primary-50 inline-block px-4 py-2 rounded-md text-primary-700">
                        {eligibility.waitingPeriod || '-'}
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Effective Date
                    </span>
                    <div className="text-[16px] font-bold text-neutral-900 bg-primary-50 inline-block px-4 py-2 rounded-md text-primary-700">
                        {eligibility.effectiveDate || '-'}
                    </div>
                </div>
                <div>
                    <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                        Required Hours
                    </span>
                    <div className="text-[16px] font-bold text-neutral-900 bg-primary-50 inline-block px-4 py-2 rounded-md text-primary-700">
                        {eligibility.requiredHours || '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}
