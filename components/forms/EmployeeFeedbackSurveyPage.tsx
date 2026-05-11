'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormValues } from '@/types/form';

const STORAGE_KEY = 'form_employee_feedback_progress';

const ENROLLMENT_OPTIONS = [
    'Employee Only',
    'Employee + Spouse',
    'Employee + Child(ren)',
    'Family',
    'Waived',
    'Not Eligible',
];

function loadSavedValues(): FormValues {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return {};
        }

        const parsed = JSON.parse(saved) as FormValues;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.error('Error loading employee feedback progress:', error);
        return {};
    }
}

function RequiredLabel({
    children,
    required = false,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="text-[15px] font-semibold text-slate-800">
            {children}
            {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
    );
}

function RadioTile({
    checked,
    label,
    onClick,
}: {
    checked: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                checked
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
            <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    checked ? 'border-brand-500' : 'border-slate-300'
                }`}
            >
                <span
                    className={`h-2.5 w-2.5 rounded-full ${
                        checked ? 'bg-brand-500' : 'bg-transparent'
                    }`}
                />
            </span>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </button>
    );
}

function SatisfactionSlider({
    label,
    value,
    onChange,
    onClear,
}: {
    label: string;
    value: number | null | undefined;
    onChange: (value: number) => void;
    onClear: () => void;
}) {
    const displayValue = value ?? '';

    return (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center justify-between gap-4">
                <RequiredLabel required>{label}</RequiredLabel>
                <span className="text-sm font-semibold text-slate-600">
                    {displayValue ? `${displayValue} / 5` : 'Not rated'}
                </span>
            </div>

            <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={value ?? 1}
                onChange={(event) => onChange(Number(event.target.value))}
                className="w-full accent-brand-500"
            />

            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Completely Unsatisfied</span>
                <span>Completely Satisfied</span>
            </div>

            <button
                type="button"
                onClick={onClear}
                className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
                Clear
            </button>
        </div>
    );
}

export default function EmployeeFeedbackSurveyPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [form, setForm] = useState<FormValues>(() => ({
        healthBenefitsEnrollment: '',
        overallBenefitsPackage: null,
        medicalPlanOptions: null,
        medicalNetwork: null,
        employeeCosts: null,
        nonMedicalBenefits: null,
        surveyComments: '',
        surveyQuestion: '',
        ...loadSavedValues(),
    }));

    useEffect(() => {
        if (typeof window === 'undefined' || isSuccess) {
            return;
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }, [form, isSuccess]);

    useEffect(() => {
        if (!isSuccess) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            router.push('/?formSubmitted=true');
            router.refresh();
        }, 2000);

        return () => window.clearTimeout(timeoutId);
    }, [isSuccess, router]);

    const pageOneValid = useMemo(() => {
        return Boolean(
            form.healthBenefitsEnrollment &&
                form.overallBenefitsPackage &&
                form.medicalPlanOptions &&
                form.medicalNetwork &&
                form.employeeCosts &&
                form.nonMedicalBenefits
        );
    }, [form]);

    const setField = (key: string, value: string | number | null) => {
        setForm((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const response = await fetch('/api/supabase/employee-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    values: form,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setSubmitError(data.message || data.error || 'Failed to submit the survey. Please try again.');
                setIsSubmitting(false);
                return;
            }

            window.localStorage.removeItem(STORAGE_KEY);
            setIsSuccess(true);
            setIsSubmitting(false);
        } catch (error) {
            console.error('Employee feedback form submission error:', error);
            setSubmitError('An error occurred while submitting the survey. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500 py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-gray-500">
                    <Link href="/" className="hover:text-brand-600 transition-colors">
                        Dashboard
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900">Employee Feedback</span>
                </div>

                <div className="flex min-h-[65vh] items-center justify-center">
                    <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Thank you</h1>
                        <p className="mt-3 text-base font-medium text-slate-500">
                            Your employee feedback was submitted successfully. Redirecting to the dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-gray-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">
                    Dashboard
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">Employee Feedback</span>
            </div>

            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
                    Employee Feedback
                </h1>
                <p className="text-[16px] text-slate-500 font-medium">
                    Share employee sentiment through the portal. Company matching is handled automatically from the logged-in account.
                </p>
            </header>

            {submitError ? (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {submitError}
                </div>
            ) : null}

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50/80 px-8 pb-5 pt-8">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-slate-700">
                            Step {step} of 2
                        </span>
                        <span className="text-[13px] font-medium text-slate-500">
                            {step === 1 ? '50% Complete' : '100% Complete'}
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-300"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        />
                    </div>
                </div>

                {step === 1 ? (
                    <div className="space-y-8 px-8 py-8 md:px-12 md:py-10">
                        <h2 className="text-[28px] font-bold tracking-tight text-slate-900">Employee Feedback</h2>

                        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="mb-6">
                                <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">
                                    Benefits Feedback Form
                                </h3>
                                <p className="mt-2 text-[15px] font-medium text-slate-500">
                                    Tell us how you are currently enrolled and rate the overall benefits experience.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <RequiredLabel required>
                                        How are you currently enrolled for health benefits?
                                    </RequiredLabel>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {ENROLLMENT_OPTIONS.map((option) => (
                                            <RadioTile
                                                key={option}
                                                label={option}
                                                checked={form.healthBenefitsEnrollment === option}
                                                onClick={() => setField('healthBenefitsEnrollment', option)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <SatisfactionSlider
                                    label="Overall Benefits Package"
                                    value={form.overallBenefitsPackage as number | null | undefined}
                                    onChange={(value) => setField('overallBenefitsPackage', value)}
                                    onClear={() => setField('overallBenefitsPackage', null)}
                                />

                                <SatisfactionSlider
                                    label="Medical Plan Options"
                                    value={form.medicalPlanOptions as number | null | undefined}
                                    onChange={(value) => setField('medicalPlanOptions', value)}
                                    onClear={() => setField('medicalPlanOptions', null)}
                                />

                                <SatisfactionSlider
                                    label="Medical Network"
                                    value={form.medicalNetwork as number | null | undefined}
                                    onChange={(value) => setField('medicalNetwork', value)}
                                    onClear={() => setField('medicalNetwork', null)}
                                />

                                <SatisfactionSlider
                                    label="Employee Costs"
                                    value={form.employeeCosts as number | null | undefined}
                                    onChange={(value) => setField('employeeCosts', value)}
                                    onClear={() => setField('employeeCosts', null)}
                                />

                                <SatisfactionSlider
                                    label="Other Benefits (Non-Medical)"
                                    value={form.nonMedicalBenefits as number | null | undefined}
                                    onChange={(value) => setField('nonMedicalBenefits', value)}
                                    onClear={() => setField('nonMedicalBenefits', null)}
                                />

                                <div className="space-y-3">
                                    <RequiredLabel>Comments</RequiredLabel>
                                    <textarea
                                        value={String(form.surveyComments || '')}
                                        onChange={(event) => setField('surveyComments', event.target.value)}
                                        className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                                        placeholder="Share any additional comments about your benefits experience"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={!pageOneValid}
                                onClick={() => setStep(2)}
                                className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 px-8 py-8 md:px-12 md:py-10">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>

                        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="space-y-3">
                                <RequiredLabel>Type your question here</RequiredLabel>
                                <input
                                    value={String(form.surveyQuestion || '')}
                                    onChange={(event) => setField('surveyQuestion', event.target.value)}
                                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-[15px] text-slate-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                                    placeholder="Optional question for the Betafits team"
                                />
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
