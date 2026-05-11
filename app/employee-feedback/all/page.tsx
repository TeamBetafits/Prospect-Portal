import React from 'react';
import Link from 'next/link';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { FeedbackResponse } from '@/types';
import { getEmployeeFeedback } from '@/lib/supabase/portal';

export const dynamic = 'force-dynamic';

export default async function EmployeeFeedbackAllPage() {
    const companyId = await getCompanyId();

    let responses: FeedbackResponse[] = [];
    if (companyId) {
        try {
            responses = (await getEmployeeFeedback(companyId)).responses;
        } catch (error) {
            console.error('[EmployeeFeedbackAllPage] Error fetching Supabase data:', error);
        }
    }

    const getTierColor = (tier: string) => {
        if (tier.includes('Family')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        if (tier.includes('Only')) return 'bg-blue-50 text-blue-700 border-blue-100';
        return 'bg-slate-50 text-slate-700 border-slate-100';
    };

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'text-green-600';
        if (score >= 3.5) return 'text-brand-600';
        if (score >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href="/employee-feedback"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                                All Feedback Responses
                            </h1>
                        </div>
                        <p className="text-[15px] text-gray-500 font-medium mt-1">
                            Complete list of all employee feedback and survey responses.
                        </p>
                    </div>
                </div>
            </header>

            {/* All Responses */}
            <section>
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            All Responses ({responses.length})
                        </h2>
                    </div>
                </div>

                {responses.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-[15px] font-medium">No feedback responses found.</p>
                        <p className="text-gray-400 text-[13px] mt-1">Survey responses will appear here once employees submit feedback.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {responses.map((response) => (
                            <div key={response.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-gray-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getTierColor(response.tier)}`}>
                                            {response.tier}
                                        </span>
                                        <span className={`text-[14px] font-bold ${getScoreColor(response.overallRating)}`}>
                                            Overall: {response.overallRating}/5
                                        </span>
                                    </div>
                                    <span className="text-[12px] text-gray-400 tabular-nums">
                                        {response.submittedAt}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                    <div>
                                        <span className="text-[11px] text-gray-500 font-medium">Options</span>
                                        <div className="text-[14px] font-bold text-gray-900">{response.medicalOptions}/5</div>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-gray-500 font-medium">Network</span>
                                        <div className="text-[14px] font-bold text-gray-900">{response.medicalNetwork}/5</div>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-gray-500 font-medium">Cost</span>
                                        <div className="text-[14px] font-bold text-gray-900">{response.medicalCost}/5</div>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-gray-500 font-medium">Non-Medical</span>
                                        <div className="text-[14px] font-bold text-gray-900">{response.nonMedical}/5</div>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-gray-500 font-medium">Retirement</span>
                                        <div className="text-[14px] font-bold text-gray-900">{response.retirement != null ? `${response.retirement}/5` : '—'}</div>
                                    </div>
                                </div>
                                {response.comments && (
                                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium mb-4">
                                        "{response.comments}"
                                    </p>
                                )}
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-4 h-4 ${star <= response.overallRating ? 'text-yellow-400' : 'text-gray-200'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
