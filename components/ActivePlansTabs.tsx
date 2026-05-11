'use client';

import React, { useState } from 'react';
import { BenefitPlan } from '@/types';
import MedicalPlansList from './MedicalPlansList';
import DentalPlansList from './DentalPlansList';
import VisionPlansList from './VisionPlansList';

interface Props {
    plans: BenefitPlan[];
}

export default function ActivePlansTabs({ plans }: Props) {
    const [activeTab, setActiveTab] = useState<'medical' | 'dental' | 'vision'>('medical');

    const medicalPlans = plans.filter(p => p.type.toLowerCase().includes('medical') || p.type.toLowerCase().includes('ppo') || p.type.toLowerCase().includes('hmo') || p.type.toLowerCase().includes('epo'));
    const dentalPlans = plans.filter(p => p.type.toLowerCase().includes('dental'));
    const visionPlans = plans.filter(p => p.type.toLowerCase().includes('vision'));

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Active Plans</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Current benefit plans available for enrollment.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-200 mb-6">
                <button
                    onClick={() => setActiveTab('medical')}
                    className={`px-4 py-2 text-[14px] font-bold transition-colors border-b-2 ${
                        activeTab === 'medical'
                            ? 'text-primary-600 border-primary-600'
                            : 'text-neutral-500 border-transparent hover:text-neutral-700'
                    }`}
                >
                    Medical ({medicalPlans.length})
                </button>
                <button
                    onClick={() => setActiveTab('dental')}
                    className={`px-4 py-2 text-[14px] font-bold transition-colors border-b-2 ${
                        activeTab === 'dental'
                            ? 'text-primary-600 border-primary-600'
                            : 'text-neutral-500 border-transparent hover:text-neutral-700'
                    }`}
                >
                    Dental ({dentalPlans.length})
                </button>
                <button
                    onClick={() => setActiveTab('vision')}
                    className={`px-4 py-2 text-[14px] font-bold transition-colors border-b-2 ${
                        activeTab === 'vision'
                            ? 'text-primary-600 border-primary-600'
                            : 'text-neutral-500 border-transparent hover:text-neutral-700'
                    }`}
                >
                    Vision ({visionPlans.length})
                </button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'medical' && <MedicalPlansList plans={medicalPlans} />}
                {activeTab === 'dental' && <DentalPlansList plans={dentalPlans} />}
                {activeTab === 'vision' && <VisionPlansList plans={visionPlans} />}
            </div>
        </div>
    );
}
