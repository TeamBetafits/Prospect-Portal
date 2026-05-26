import React from 'react';
import { DemographicInsights as DemographicInsightsType } from '@/types';

interface Props {
    demographics: DemographicInsightsType;
}

export default function DemographicInsights({ demographics }: Props) {
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Demographic Insights</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Key company demographics that shape benefit needs and cost trends.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="bg-neutral-50/50 p-6 rounded-md border border-neutral-100 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-primary-600 mb-3 shadow-card">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Eligible Employees</div>
                    <div className="text-2xl font-black text-neutral-900">{demographics.eligibleEmployees}</div>
                </div>
                <div className="bg-neutral-50/50 p-6 rounded-md border border-neutral-100 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-blue-600 mb-3 shadow-card">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Average Salary</div>
                    <div className="text-2xl font-black text-neutral-900">{formatCurrency(demographics.averageSalary)}</div>
                </div>
                <div className="bg-neutral-50/50 p-6 rounded-md border border-neutral-100 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-amber-600 mb-3 shadow-card">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Average Age</div>
                    <div className="text-2xl font-black text-neutral-900">{Number(demographics.averageAge).toFixed(1)} <span className="text-sm font-medium text-neutral-400">YRS</span></div>
                </div>
            </div>
            <div className="mt-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Gender Composition</div>
                        <div className="text-[16px] font-bold text-neutral-900">Workforce Split</div>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md">Male {Number(demographics.malePercentage).toFixed(1)}%</span>
                        <span className="text-sm font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-md">Female {Number(demographics.femalePercentage).toFixed(1)}%</span>
                    </div>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${demographics.malePercentage}%` }}></div>
                    <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${demographics.femalePercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
}
