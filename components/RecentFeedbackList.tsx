'use client';

import React from 'react';
import { FeedbackResponse } from '@/types';

interface Props {
    responses: FeedbackResponse[];
}

export default function RecentFeedbackList({ responses }: Props) {
    const getTierColor = (tier: string) => {
        if (tier.includes('Family')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        if (tier.includes('Only')) return 'bg-blue-50 text-blue-700 border-blue-100';
        return 'bg-slate-50 text-slate-700 border-slate-100';
    };

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'text-green-600';
        if (score >= 3.5) return 'text-primary-600';
        if (score >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (responses.length === 0) {
        return (
            <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Recent Feedback</h2>
                    <p className="text-[13px] text-neutral-500 mt-0.5">Latest employee feedback responses.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-neutral-500">No recent feedback available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Recent Feedback</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Latest employee feedback responses.</p>
            </div>
            <div className="space-y-4">
                {responses.slice(0, 5).map((response) => (
                    <div key={response.id} className="border border-neutral-200 rounded-md p-4 hover:border-neutral-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getTierColor(response.tier)}`}>
                                    {response.tier}
                                </span>
                                <span className={`text-[14px] font-bold ${getScoreColor(response.overallRating)}`}>
                                    {response.overallRating}/5
                                </span>
                            </div>
                            <span className="text-[12px] text-neutral-400 tabular-nums">
                                {response.submittedAt}
                            </span>
                        </div>
                        {response.comments && (
                            <p className="text-[14px] text-neutral-700 leading-relaxed font-medium mb-3">
                                "{response.comments}"
                            </p>
                        )}
                        <div className="flex items-center gap-4 text-[12px] text-neutral-500">
                            <span>Options: {response.medicalOptions}/5</span>
                            <span>Network: {response.medicalNetwork}/5</span>
                            <span>Cost: {response.medicalCost}/5</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
