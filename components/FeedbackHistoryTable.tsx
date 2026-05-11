'use client';

import React from 'react';
import { FeedbackResponse } from '@/types';

interface Props {
    responses: FeedbackResponse[];
}

export default function FeedbackHistoryTable({ responses }: Props) {
    if (responses.length === 0) {
        return (
            <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Feedback History</h2>
                    <p className="text-[13px] text-neutral-500 mt-0.5">Full history of survey responses.</p>
                </div>
                <div className="text-center py-12">
                    <p className="text-[14px] text-neutral-500">No feedback history available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Feedback History</h2>
                <p className="text-[13px] text-neutral-500 mt-0.5">Full history of survey responses.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200">
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Tier
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Overall Rating
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Medical Options
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Medical Network
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Medical Cost
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Non-Medical
                            </th>
                            <th className="text-left py-3 px-4 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
                                Comments
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {responses.map((response) => (
                            <tr key={response.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                <td className="py-4 px-4 text-[14px] text-neutral-900 tabular-nums">
                                    {response.submittedAt}
                                </td>
                                <td className="py-4 px-4 text-[14px] font-medium text-neutral-900">
                                    {response.tier}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-3.5 h-3.5 ${star <= response.overallRating ? 'text-yellow-400' : 'text-neutral-200'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2 text-[13px] font-semibold text-neutral-700">{response.overallRating}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-[14px] text-neutral-600">
                                    {response.medicalOptions}
                                </td>
                                <td className="py-4 px-4 text-[14px] text-neutral-600">
                                    {response.medicalNetwork}
                                </td>
                                <td className="py-4 px-4 text-[14px] text-neutral-600">
                                    {response.medicalCost}
                                </td>
                                <td className="py-4 px-4 text-[14px] text-neutral-600">
                                    {response.nonMedical}
                                </td>
                                <td className="py-4 px-4 text-[14px] text-neutral-600 max-w-md">
                                    <p className="truncate" title={response.comments || ''}>
                                        {response.comments || '-'}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
