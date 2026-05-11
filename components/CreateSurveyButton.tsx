'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateSurveyButtonProps {
    variant?: 'header' | 'card';
}

export default function CreateSurveyButton({ variant = 'header' }: CreateSurveyButtonProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateSurvey = async () => {
        setError(null);
        setIsCreating(true);
        try {
            // Create survey record in Airtable (Pulse Surveys table) so it appears in the portal
            const res = await fetch('/api/surveys/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: 'Employee feedback survey' }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data?.error || 'Failed to create survey');
                setIsCreating(false);
                return;
            }
            router.push('/forms/benefits-feedback');
        } catch {
            setError('Failed to create survey');
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenFormOnly = () => {
        router.push('/forms/benefits-feedback');
    };

    if (variant === 'card') {
        return (
            <div className="space-y-2">
                <button
                    onClick={handleCreateSurvey}
                    disabled={isCreating}
                    className="w-full bg-primary-500 text-white rounded-md py-3 px-4 font-bold text-[14px] hover:bg-primary-600 transition-all shadow-card active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isCreating ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Creating…</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create Survey</span>
                        </>
                    )}
                </button>
                {error && <p className="text-[12px] text-red-600 font-medium">{error}</p>}
            </div>
        );
    }

    return (
        <button
            onClick={handleOpenFormOnly}
            className="bg-primary-500 text-white px-4 py-2 rounded-md font-semibold text-[13px] hover:bg-primary-600 transition-all shadow-card active:scale-[0.98]"
        >
            Open Form
        </button>
    );
}
