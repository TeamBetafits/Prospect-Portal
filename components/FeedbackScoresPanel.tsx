'use client';

import React from 'react';
import { FeedbackResponse } from '@/types';

interface Props {
    responses: FeedbackResponse[];
}

export default function FeedbackScoresPanel({ responses }: Props) {
    // Group by tier instead of category
    const tierScores: Record<string, { total: number; count: number; avg: number }> = {};

    responses.forEach(response => {
        if (!tierScores[response.tier]) {
            tierScores[response.tier] = { total: 0, count: 0, avg: 0 };
        }
        tierScores[response.tier].total += response.overallRating;
        tierScores[response.tier].count += 1;
    });

    Object.keys(tierScores).forEach(tier => {
        tierScores[tier].avg = tierScores[tier].total / tierScores[tier].count;
    });

    const sortedTiers = Object.entries(tierScores).sort((a, b) => b[1].avg - a[1].avg);

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Scores by Tier</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Average ratings grouped by coverage tier.</p>
            </div>
            <div className="space-y-4">
                {sortedTiers.length > 0 ? sortedTiers.map(([tier, data]) => (
                    <div key={tier} className="flex items-center justify-between p-4 bg-neutral-50 rounded-md border border-neutral-100">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[14px] font-semibold text-neutral-900">{tier}</span>
                                <span className="text-[14px] font-bold text-neutral-700">{data.avg.toFixed(1)}/5.0</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                                <div
                                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(data.avg / 5) * 100}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1">{data.count} response{data.count !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                )) : (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-16 h-16 bg-neutral-50 rounded-md flex items-center justify-center">
                            <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
