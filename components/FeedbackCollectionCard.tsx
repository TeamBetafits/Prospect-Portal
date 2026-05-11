'use client';

import React, { useState } from 'react';
import CreateSurveyButton from './CreateSurveyButton';

interface Props {
    surveyUrl?: string;
    surveyFormUrl?: string;
}

export default function FeedbackCollectionCard({ surveyUrl, surveyFormUrl }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (surveyUrl) {
            navigator.clipboard.writeText(surveyUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenForm = () => {
        if (surveyFormUrl) {
            window.open(surveyFormUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-1">Employee Feedback Collection</h3>
                <p className="text-[13px] text-neutral-500 mt-0.5">Please share this survey link with your employees to collect feedback on your benefits program. This helps us evaluate the quality of your current plan and identify opportunities for improvement.</p>
            </div>

            {surveyUrl ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded border border-green-200">
                            Active Survey
                        </span>
                    </div>
                    <div>
                        <label className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                            Survey URL
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={surveyUrl}
                                readOnly
                                className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-[14px] font-mono text-neutral-700"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-2 bg-primary-500 text-white rounded-md text-[13px] font-bold hover:bg-primary-600 transition-colors whitespace-nowrap"
                            >
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                    {surveyFormUrl && (
                        <button
                            onClick={handleOpenForm}
                            className="w-full px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md text-[13px] font-bold hover:bg-neutral-50 transition-colors"
                        >
                            Open Form
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="text-center py-4">
                        <p className="text-[14px] text-neutral-500 mb-4">No active survey. Create a new survey to get started.</p>
                    </div>
                    <CreateSurveyButton variant="card" />
                </div>
            )}
        </div>
    );
}
